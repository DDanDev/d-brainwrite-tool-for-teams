import { ChangeEventHandler, FC } from 'react';
import { BoardObj } from '../types/Board';
import { User } from '../types/User';

export const Board: FC<{
	board: BoardObj;
	theme?: string;
	currentRound?: number;
	rounds?: number;
	handleNext?: () => void;
	allUsers: User[];
	handleInput: ChangeEventHandler<HTMLInputElement>;
	msTimer?: number;
	restartAll?: () => void;
}> = ({ board, theme, currentRound, rounds, handleNext, allUsers, handleInput, msTimer, restartAll }) => {
	return (
		<>
			{currentRound !== undefined && <h2>{`Round ${currentRound + 1} of ${rounds}`}</h2>}
			{msTimer !== undefined && (
				<p style={{ marginBottom: '1rem' }}>
					{`${Math.trunc(msTimer / 1000 / 60)}:${String(Math.trunc((msTimer / 1000) % 60)).padStart(2, '0')}`}
				</p>
			)}
			{theme && <p style={{ marginBottom: '0.5rem' }}>{theme}</p>}
			{restartAll && (
				<button
					onClick={restartAll}
					style={{
						padding: '3px 5px',
						position: 'absolute',
						top: '0.25rem',
						right: '0.25rem',
					}}
				>
					Restart
				</button>
			)}
			{board.entries.map((entry, entryIndex) => {
				if (!entry) return;
				return (
					<div
						style={{
							display: 'flex',
							padding: '0.25rem',
							gap: '0.5rem',
							alignItems: 'center',
							background:
								allUsers.find((user) => user.userId === entry.userId)?.data?.color || 'hsl(20,5%,34%)',
						}}
						key={`${board.boardId}${entryIndex}`}
					>
						<p style={{ width: '10rem' }}>{entry.userName}</p>
						{entry.terms.map((term, termIndex) => (
							<input
								name={`${termIndex}`}
								key={`${board.boardId}${entryIndex}${termIndex}`}
								value={term}
								placeholder='Type here'
								onChange={handleInput}
								disabled={entryIndex !== currentRound || board.readyForNextRound}
								className='terms'
							/>
						))}
					</div>
				);
			})}
			{handleNext && (
				<button
					onClick={handleNext}
					className={`${board.readyForNextRound ? 'readyForNext' : ''}`}
					style={{ marginTop: '1rem' }}
				>
					Ready!
				</button>
			)}
		</>
	);
};
