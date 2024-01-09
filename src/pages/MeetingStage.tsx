import {
	useLiveShareContext,
	useLivePresence,
	useSharedState,
	useSharedMap,
	useLiveTimer,
} from '@microsoft/live-share-react';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { Setup } from '../components/Setup';
import { FSMessage } from '../components/FSMessage';
import { Board } from '../components/Board';
import { AllBoards } from '../components/AllBoards';
import { BoardObj } from '../types/Board';
import { PresenceState } from '@microsoft/live-share';
import { colorFromPalette } from '../utils/colorFromPalette';

export const MeetingStage = () => {
	// Live Share resources
	const { joined, joinError } = useLiveShareContext();
	const { localUser, allUsers, updatePresence } = useLivePresence('presence', {
		color: '',
	});
	const { start: startTimer, milliRemaining: msTimer } = useLiveTimer('roundtimer');

	// User Setup
	const [theme, setTheme] = useSharedState('theme', ''); // Reference for context on what users will discuss
	const [rounds, setRounds] = useSharedState('rounds', 0); // How many rounds will they go through, usually as many as there are participants, up to 5
	const [terms, setTerms] = useSharedState('terms', 3); // How many keywords each participant is supposed to add per round. Not enforced.
	const [timer, setTimer] = useSharedState('timer', 5); // How many minutes for a reference timer displayed so that users can keep track and not take too long

	// User Setup suggestion of one round per user, up to 10
	useEffect(() => {
		if (started) return;
		const nOfUsers = allUsers.filter((user) => user.state === PresenceState.online).length;
		setRounds(nOfUsers > 10 ? 10 : nOfUsers);
	}, [allUsers]);

	// Rounds Logic
	const [started, setStarted] = useSharedState('started', false); // Moves out of setup when true
	const [inProgress, setInProgress] = useSharedState('inProgress', false); // Disables setup inputs temporarily
	const [order, setOrder] = useSharedState('order', [] as string[]); // Ordered array of user ids to determine who each user passes their board to
	const [currentRound, setCurrentRound] = useSharedState('currentround', -1); // First round is 0 and incremented up to 'rounds' setup
	const { map: boards, setEntry: setBoards, sharedMap: boardsMap } = useSharedMap<BoardObj>('boards'); // Map enables us to work on each board individually without each user conflicting with each other. See BoardObj type for more info.

	// Local logic
	const [firstBoardIndex, setFirstBoardIndex] = useState<number>(-1);
	const [notParticipating, setNotParticipating] = useState(false);
	const [localBoard, setLocalBoard] = useState<BoardObj>({
		boardId: '',
		readyForNextRound: false,
		entries: [],
	});

	// Clear all logic when back to start
	useEffect(() => {
		if (started) return;
		setInProgress(false);
		setOrder([]);
		setCurrentRound(-1);
		boardsMap?.clear();
		setFirstBoardIndex(-1);
		setNotParticipating(false);
	}, [started]);

	/** To start, define the order the users will send their boards around, then start the first round #0 */
	const handleStart = () => {
		// Disable everyone's setup input to avoid issues
		setInProgress(true);

		// Create one board for each user while saving the order the users will send their boards around
		const makeOrder = [];
		for (const user of allUsers) {
			if (user.state === PresenceState.online) {
				const id = user.userId;
				makeOrder.push(id);
				setBoards(id, {
					readyForNextRound: false,
					boardId: id,
					entries: Array(rounds),
				});
			}
		}
		setOrder(makeOrder);

		// Tell everyone that round #0 is ready
		setCurrentRound(0);
		setStarted(true);
		setInProgress(false);
	};

	// When each user receives the order array from whoever clicked start, they will retrieve their own position in the order and generate a unique color for their entries
	useEffect(() => {
		if (order.length === 0 || !localUser?.userId) return;

		const localFirstBoardIndex = order.indexOf(localUser.userId);
		if (localFirstBoardIndex === -1) {
			setNotParticipating(true);
			return;
		}
		setFirstBoardIndex(localFirstBoardIndex);
		updatePresence({ color: colorFromPalette(order.length, localFirstBoardIndex) });
	}, [order, localUser?.userId]);

	// When all is ready, and each time current round is updated, retrieve the board the user will work on locally
	useEffect(() => {
		if (
			currentRound < 0 ||
			!localUser?.userId ||
			order.length === 0 ||
			firstBoardIndex < 0 ||
			currentRound >= rounds
		)
			return;

		// Retrieve the board for the current round given the user's starting position in the order
		const localBoardGet = boards.get(order[(firstBoardIndex + currentRound) % order.length]);
		
		if (!localBoardGet) {
			setNotParticipating(true); // shouldn't happen, just to avoid unexpected errors
			return;
		}
		if (localBoardGet.entries[currentRound]?.terms.length > 0) return; // avoid an accidental rerender clearing out the terms the user was already working on

		// add this round to this board. Entry was < empty > up until this point. We save who's adding terms and initialize the array the input handler will use.
		localBoardGet.entries[currentRound] = {
			userId: localUser.userId,
			userName: localUser.displayName || localUser.userId.slice(0, 7),
			terms: Array(terms).fill(''),
		};

		// Save locally (we will work on the board offline), and publish this board, so everyone else knows its not ready.
		localBoardGet.readyForNextRound = false; // (local user will receive it with ready = true from the previous user)
		setLocalBoard(localBoardGet);
		setBoards(localBoardGet.boardId, localBoardGet);

		// Start the round timer. Everyone will do this meaning if there's lag the timer might restart a few times at the beggining of the round.
		startTimer(timer * 1000 * 60);
	}, [currentRound, firstBoardIndex, localUser?.userId, order]);

	/** Updates local board values as user types. Event target name must be the index of the term to update. */
	const handleInput: ChangeEventHandler<HTMLInputElement> = (e) => {
		setLocalBoard((prev) => {
			const previous = { ...prev };
			previous.entries[currentRound].terms[parseInt(e.target.name)] = e.target.value;
			return previous;
		});
	};

	/** OnClick 'Ready' button, toggle this board's ready status and update its contents with the new terms.
	 * While ready, inputs for the user will be blocked and the button highlighted.
	 * 
	 * If everyone else is also ready, increment current round to start the next round by triggering the previous useEffect
	 * When current round is equal to number of rounds that was setup, show all boards.
	 */
	const handleNext = () => {
		const update = {
			...localBoard,
			readyForNextRound: !localBoard.readyForNextRound,
		};
		setBoards(localBoard.boardId, update);
		setLocalBoard(update);

		// check all other boards ready === true, increment currentRound
		let allAreReady = update.readyForNextRound;
		if (allAreReady) { // if local user ready, check the others
			boards.forEach((board) => {
				if (board.readyForNextRound === false && board.boardId !== localBoard.boardId) {
					allAreReady = false;
				}
			});
		}
		if (allAreReady) setCurrentRound(currentRound + 1);
	};

	/** Method to reset or start over after finished. Will trigger the started useEffect and start all over, if user confirms */
	const restartAll = () => {
		const ask = confirm(
			'This will clear everything for everyone and go back to the setup. Are you sure you want to continue?'
		);
		if (ask) setStarted(false);
	};

	return joinError ? (
		<FSMessage text={joinError.message} />
	) : !joined ? (
		<FSMessage text='Joining Live Share' />
	) : !started ? (
		<Setup
			disabled={inProgress}
			theme={theme}
			setTheme={setTheme}
			rounds={rounds}
			setRounds={setRounds}
			setTerms={setTerms}
			terms={terms}
			setTimer={setTimer}
			timer={timer}
			handleStart={handleStart}
		/>
	) : notParticipating ? (
		<FSMessage text='You must have joined when the session was set up' />
	) : !(currentRound >= rounds) ? (
		<Board
			board={localBoard}
			theme={theme}
			currentRound={currentRound}
			handleNext={handleNext}
			allUsers={allUsers}
			handleInput={handleInput}
			msTimer={msTimer}
			restartAll={restartAll}
			rounds={rounds}
		/>
	) : (
		<AllBoards
			theme={theme}
			boards={boards}
			restartAll={restartAll}
			allUsers={allUsers}
			handleInput={handleInput}
		/>
	);
};
