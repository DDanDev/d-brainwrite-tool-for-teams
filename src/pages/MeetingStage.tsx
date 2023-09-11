import {
	useLiveShareContext,
	useLivePresence,
	useSharedState,
	useSharedMap,
} from '@microsoft/live-share-react';
import {
	ChangeEventHandler,
	useEffect,
	useState,
} from 'react';
import './MeetingStage.scss';

export const MeetingStage = () => {
	const { joined, joinError } = useLiveShareContext();

	const { localUser, allUsers } = useLivePresence('presence');
	const [theme, setTheme] = useSharedState('theme', '');
	const [rounds, setRounds] = useSharedState('rounds', 0);
	const [terms, setTerms] = useSharedState('terms', 3);
	const [timer, setTimer] = useSharedState('timer', 5);

	useEffect(() => {
		setRounds(allUsers.length); // might want to use a button to refresh or make this only happen at the beginning
	}, [allUsers]);

	const [started, setStarted] = useSharedState('started', false);
	const [disabled, setDisabled] = useSharedState('disabled', false);
	const [order, setOrder] = useSharedState('order', [] as string[]);
	const [currentRound, setCurrentRound] = useSharedState('currentround', -1);
	const [firstBoardIndex, setFirstBoardIndex] = useState<number>(-1);
	const [notParticipating, setNotParticipating] = useState(false);
	type Entry = { userId: string; userName: string; terms: string[] };
	type Board = {
		entries: Entry[];
		readyForNextRound: boolean;
		boardId: string;
	};
	const {
		map: boards,
		setEntry: setBoards,
		sharedMap: boardsMap,
	} = useSharedMap<Board>('boards');

	useEffect(() => {
		if (started) return;
		setOrder([]);
		setCurrentRound(-1);
		setFirstBoardIndex(-1);
		setNotParticipating(false);
		boardsMap?.clear();
	}, [started]);

	const handleStart = () => {
		setDisabled(true);

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
		setDisabled(false);
	};
	useEffect(() => {
		if (order.length === 0 || !localUser?.userId) return;

		const localFirstBoardIndex = order.indexOf(localUser.userId);
		if (localFirstBoardIndex === -1) {
			setNotParticipating(true);
			return;
		}
		setFirstBoardIndex(localFirstBoardIndex);
	}, [order]);

	const [localBoard, setLocalBoard] = useState<Board>({
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
		)
			return;
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

	const [boardsDisplay, setBoardsDisplay] = useState<any>([]);

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

		// rudimentary final display of all boards
		const makeboardsDisplay: any = [];
		boards.forEach((board, boardId) => {
			makeboardsDisplay.push(
				<>
					<hr key={boardId+'hr'} style={{ width: '70%', marginTop: '2rem' }} />
					<h3 key={boardId}>{`board started by: ${
						board?.entries[0]?.userName || boardId.slice(0, 7)
					}`}</h3>
				</>
			);
			for (const entry of board.entries) {
				if (!entry) continue;
				makeboardsDisplay.push(
					<div
						style={{
							display: 'flex',
							margin: '0.5rem',
							gap: '1rem',
							alignItems: 'center',
						}}
					>
						<p key={`${boardId}${entry.userId}p`}>{`${entry.userName}`}</p>
						{entry.terms.map((term, termIndex) => (
							<input
								disabled
								value={term}
								key={`${boardId + entry.userId + termIndex}`}
								style={{ padding: '1rem' }}
							/>
						))}
					</div>
				);
			}
		});
		setBoardsDisplay(makeboardsDisplay);
	}, [boards]);

	const restartAll = () => {
		const ask = confirm(
			'This will clear everything for everyone. Are you sure you want to continue?'
		);
		if (ask) setStarted(false);
	};

	return joinError ? (
		<h1>joinError.message</h1>
	) : !joined ? (
		<h1>Joining Live Share</h1>
	) : !started ? (
		<>
			<h1>D Brainwrite Tool for Teams</h1>
			<p style={{ padding: '0 2rem' }}>
				Use design thinking brainwriting method to brainstorm ideas in group!
				First, you will set up how many rounds you will go through, how many
				terms each participant must add per round and a reference time limit for
				each round. You will also talk to each other and define a goal for the
				session. In the first round, each participant in the meeting will start
				a 'board' with a number of terms they think up relating to the goal of
				the session. When everyone is ready, each board goes to the next
				participant and a new round is started. For each round, each participant
				will add a number of terms to the board they receive that contributes to
				the ideas that are already in that board. Normally, you will have as
				many rounds as participants, so everyone starts an idea thread and
				everyone else gets a chance to further elaborate on each other's ideas.
			</p>
			<hr style={{ width: '80%', margin: '2rem 0' }} />
			<h2>Set a theme for your brainstom:</h2>
			<textarea
				style={{
					width: '70%',
					height: '4rem',
					minHeight: '4rem',
					resize: 'none',
				}}
				disabled={disabled}
				value={theme}
				placeholder='An app to help students organize their schedule. Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga porro nulla eius eum fugit. Excepturi, quidem culpa explicabo delectus ea nihil ab corporis quia quaerat cum, consectetur nam rerum eaque.'
				onChange={(e) => {
					setTheme(e.target.value);
				}}
			/>
			<h2 style={{ paddingTop: '1rem' }}>Set the format:</h2>
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<div>
					<input
						disabled={disabled}
						type='number'
						value={rounds}
						onChange={(e) => {
							setRounds(parseInt(e.target.value));
						}}
					/>
					<p>Rounds</p>
				</div>
				<p style={{ fontSize: '3rem', marginTop: '-1.5rem' }}>&nbsp;-&nbsp;</p>
				<div>
					<input
						disabled={disabled}
						type='number'
						value={terms}
						onChange={(e) => {
							setTerms(parseInt(e.target.value));
						}}
					/>
					<p>Terms</p>
				</div>
				<p style={{ fontSize: '3rem', marginTop: '-1.5rem' }}>&nbsp;-&nbsp;</p>
				<div>
					<input
						disabled={disabled}
						type='number'
						value={timer}
						onChange={(e) => {
							setTimer(parseInt(e.target.value));
						}}
					/>
					<p>Timer</p>
				</div>
			</div>
			<button
				disabled={disabled}
				className='primary'
				style={{ marginTop: '1rem' }}
				onClick={handleStart}
			>
				Start!
			</button>
		</>
	) : notParticipating ? (
		<h2>You must have joined when the session was set up</h2>
	) : !(currentRound >= rounds) ? (
		<>
			{/* // Populate terms by adding straight to localBoard[localUser.userId][termNumber] */}
			{`Round number ${currentRound + 1}`}
			{localBoard.entries.map((entry, entryIndex) => {
				if (!entry) return;
				return (
					<div
						style={{
							display: 'flex',
							margin: '0.5rem',
							gap: '1rem',
							alignItems: 'center',
						}}
					>
						<p>{entry.userName}</p>
						{entry.terms.map((term, termIndex) => (
							<input
								name={`${termIndex}`}
								value={term}
								placeholder='Type here'
								onChange={handleInput}
								disabled={entryIndex !== currentRound}
								style={{ padding: '1rem', textAlign: 'center' }}
							/>
						))}
					</div>
				);
			})}
			<button onClick={handleNext}>Ready!</button>
			<button onClick={restartAll}>reset</button>
		</>
	) : (
		<>
			<h1>Finished Boards</h1>
			<h3>
				Local user: {localUser?.displayName || 'waiting for local user id'}
			</h3>
			{boardsDisplay}
			<div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
				<button onClick={restartAll}>reset</button>
			</div>
		</>
	);
};
