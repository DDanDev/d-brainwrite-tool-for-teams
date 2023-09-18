import { ChangeEventHandler, FC } from 'react';
import { BoardObj } from '../types/Board';
import { User } from '../types/User';

export const Board: FC<{
	board: BoardObj;
	theme: string;
	currentRound: number;
	handleNext: () => void;
	allUsers: User[];
	handleInput: ChangeEventHandler<HTMLInputElement>;
	msTimer?: number;
	restartAll: () => void;
}> = ({
	board,
	theme,
	currentRound,
	handleNext,
	allUsers,
	handleInput,
	msTimer,
	restartAll,
}) => {
	return (
		<>
			{/* // Populate terms by adding straight to localBoard[localUser.userId][termNumber] */}
			<p>{`Round number ${currentRound + 1}`}</p>
			<p>{theme}</p>
			{board.entries.map((entry, entryIndex) => {
				if (!entry) return;
				return (
					<div
						style={{
							display: 'flex',
							margin: '0.5rem',
							padding: '0.5rem',
							gap: '1rem',
							alignItems: 'center',
							background:
								allUsers.find((user) => user.userId === entry.userId)?.data
									?.color || 'hsl(20,5%,34%)',
						}}
					>
						<p style={{ width: '10rem' }}>{entry.userName}</p>
						{entry.terms.map((term, termIndex) => (
							<input
								name={`${termIndex}`}
								key={`${board.boardId}${entryIndex}${termIndex}`}
								value={term}
								placeholder='Type here'
								onChange={handleInput}
								disabled={entryIndex !== currentRound}
								style={{
									padding: '1rem',
									textAlign: 'center',
									background: 'rgba(10,10,10,0.35)',
								}}
							/>
						))}
					</div>
				);
			})}
			{msTimer !== undefined && (
				<>
					<p style={{ margin: '1rem' }}>{`${parseInt(
						`${msTimer / 1000 / 60}`
					)}:${parseInt(`${(msTimer / 1000) % 60}`)}`}</p>
					<button onClick={handleNext}>Ready!</button>
				</>
			)}
			<button onClick={restartAll}>reset</button>
		</>
	);
};
