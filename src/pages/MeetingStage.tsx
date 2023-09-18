import {
	useLiveShareContext,
	useLivePresence,
	useSharedState,
	useSharedMap,
	useLiveTimer,
} from '@microsoft/live-share-react';
import { ChangeEventHandler, useEffect, useState } from 'react';
import './MeetingStage.scss';
import { Setup } from '../components/Setup';
import { FSMessage } from '../components/FSMessage';
import { Board } from '../components/Board';
import { AllBoards } from '../components/AllBoards';
import { BoardObj } from '../types/Board';

const colors = [
	'hsl(0,50%,55%)',
	'hsl(180,50%,55%)',
	'hsl(90,50%,55%)',
	'hsl(270,50%,55%)',
	'hsl(45,50%,55%)',
	'hsl(135,50%,55%)',
	'hsl(225,50%,55%)',
	'hsl(315,50%,55%)',
];

export const MeetingStage = () => {
	const { joined, joinError } = useLiveShareContext();

	const { localUser, allUsers, updatePresence } = useLivePresence('presence', {
		color: '',
	});
	const [theme, setTheme] = useSharedState('theme', '');
	const [rounds, setRounds] = useSharedState('rounds', 0);
	const [terms, setTerms] = useSharedState('terms', 3);
	const [timer, setTimer] = useSharedState('timer', 5);

	const {
		start: startTimer,
		milliRemaining: msTimer,
		pause: pauseTimer,
	} = useLiveTimer('roundtimer');

	useEffect(() => {
		setRounds(allUsers.length); // might want to use a button to refresh or make this only happen at the beginning
	}, [allUsers]);

	const [started, setStarted] = useSharedState('started', false);
	const [createInProgress, setCreateInProgress] = useSharedState(
		'disabled',
		false
	);
	const [order, setOrder] = useSharedState('order', [] as string[]);
	const [currentRound, setCurrentRound] = useSharedState('currentround', -1);
	const [firstBoardIndex, setFirstBoardIndex] = useState<number>(-1);
	const [notParticipating, setNotParticipating] = useState(false);

	const {
		map: boards,
		setEntry: setBoards,
		sharedMap: boardsMap,
	} = useSharedMap<BoardObj>('boards');

	useEffect(() => {
		if (started) return;
		setOrder([]);
		setCurrentRound(-1);
		setFirstBoardIndex(-1);
		setNotParticipating(false);
		boardsMap?.clear();
	}, [started]);

	const handleStart = () => {
		setCreateInProgress(true);

		const makeOrder = [];

		for (const user of allUsers) {
			const id = user.userId;
			makeOrder.push(id);
			setBoards(id, {
				readyForNextRound: false,
				boardId: id,
				entries: Array(rounds),
			});
		}
		setOrder(makeOrder);
		setCurrentRound(currentRound + 1);
		setStarted(true);
		setCreateInProgress(false);
	};

	useEffect(() => {
		if (order.length === 0 || !localUser?.userId) return;

		const localFirstBoardIndex = order.indexOf(localUser.userId);
		if (localFirstBoardIndex === -1) {
			setNotParticipating(true);
			return;
		}
		setFirstBoardIndex(localFirstBoardIndex);
		updatePresence({ color: colors[localFirstBoardIndex % colors.length] });
	}, [order]);

	const [localBoard, setLocalBoard] = useState<BoardObj>({
		readyForNextRound: false,
		boardId: '',
		entries: [],
	});
	// Boards Component! Remove from here
	useEffect(() => {
		if (
			currentRound < 0 ||
			!localUser?.userId ||
			order.length === 0 ||
			firstBoardIndex < 0 ||
			currentRound >= rounds
		) {
			pauseTimer();
			return;
		}
		// useEffect on load and [currentRound]
		const localBoardGet = boards.get(
			order[(firstBoardIndex + currentRound) % order.length]
		); // probably in a local state, to display only the one
		if (!localBoardGet) throw 'board not found';

		// add this round to this board
		localBoardGet.entries[currentRound] = {
			userId: localUser.userId,
			userName: localUser.displayName || localUser.userId.slice(0, 7),
			terms: Array(terms).fill(''),
		};
		localBoardGet.readyForNextRound = false;
		setLocalBoard(localBoardGet);
		setBoards(localBoardGet.boardId, localBoardGet);
		startTimer(timer * 1000 * 60);
	}, [currentRound, firstBoardIndex]);

	const handleInput: ChangeEventHandler<HTMLInputElement> = (e) => {
		setLocalBoard((prev) => {
			const previous = { ...prev };
			previous.entries[currentRound].terms[parseInt(e.target.name)] =
				e.target.value;
			return previous;
		});
	};

	// OnClick Ready for Next button
	const handleNext = () => {
		setBoards(localBoard.boardId, {
			...localBoard,
			readyForNextRound: true,
		});
	};

	// const [boardsDisplay, setBoardsDisplay] = useState<any>([]);

	const [boardsArray, setBoardsArray] = useState<BoardObj[]>([]);

	useEffect(() => {
		// check all boards ready === true, increment currentRound
		let allAreReady = true;
		boards.forEach((board) => {
			// try to put this on handlenext so only the last person that clicks does this check and changes shared round number, instead of everyone both when round changes and each time someone becomes ready. Will have to try using boardsMap instead of boards to get up to date values after the set. Or use a local variable with all boards plus the new one.
			if (board.readyForNextRound === false) {
				allAreReady = false;
			}
		});
		if (allAreReady) setCurrentRound(currentRound + 1);

		const makeBoardsArray: BoardObj[] = [];
		boards.forEach((board) => {
			makeBoardsArray.push(board);
		});
		setBoardsArray(makeBoardsArray);

		// rudimentary final display of all boards
		// const makeboardsDisplay: any = [];
		// boards.forEach((board, boardId) => {
		// 	makeboardsDisplay.push(
		// 		<>
		// 			<hr
		// 				key={boardId + 'hr'}
		// 				style={{ width: '70%', marginTop: '2rem' }}
		// 			/>
		// 			<h3 key={boardId}>{`board started by: ${
		// 				board?.entries[0]?.userName || boardId.slice(0, 7)
		// 			}`}</h3>
		// 		</>
		// 	);
		// 	for (const entry of board.entries) {
		// 		if (!entry) continue;
		// 		makeboardsDisplay.push(
		// 			<div
		// 				style={{
		// 					display: 'flex',
		// 					margin: '0.5rem',
		// 					padding: '0.5rem',
		// 					gap: '1rem',
		// 					alignItems: 'center',
		// 					background:
		// 						allUsers.find((user) => user.userId === entry.userId)?.data
		// 							?.color || 'hsl(20,5%,34%)',
		// 				}}
		// 			>
		// 				<p
		// 					key={`${boardId}${entry.userId}p`}
		// 					style={{ width: '10rem' }}
		// 				>{`${entry.userName}`}</p>
		// 				{entry.terms.map((term, termIndex) => (
		// 					<input
		// 						disabled
		// 						value={term}
		// 						key={`${boardId + entry.userId + termIndex}`}
		// 						style={{ padding: '1rem', background: 'rgba(10,10,10,0.2)' }}
		// 					/>
		// 				))}
		// 			</div>
		// 		);
		// 	}
		// });
		// setBoardsDisplay(makeboardsDisplay);
	}, [boards]);

	const restartAll = () => {
		const ask = confirm(
			'This will clear everything for everyone. Are you sure you want to continue?'
		);
		if (ask) setStarted(false);
	};

	return joinError ? (
		<FSMessage text={joinError.message} />
	) : !joined ? (
		<FSMessage text='Joining Live Share' />
	) : !started ? (
		<Setup
			disabled={createInProgress}
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
		/>
	) : (
		<AllBoards
			theme={theme}
			boards={boardsArray}
			restartAll={restartAll}
			currentRound={currentRound}
			allUsers={allUsers}
			handleInput={handleInput}
		/>
	);
};
