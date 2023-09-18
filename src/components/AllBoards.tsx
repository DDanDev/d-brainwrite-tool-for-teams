import { FC } from 'react';
import { Board } from './Board';
import { BoardObj } from '../types/Board';
import { User } from '../types/User';
import { ChangeEventHandler } from 'react';

export const AllBoards: FC<{
	theme: string;
	boards: BoardObj[];
	restartAll: () => void;
	currentRound: number;
	allUsers: User[];
	handleInput: ChangeEventHandler<HTMLInputElement>;
}> = ({ theme, boards, restartAll, currentRound, allUsers, handleInput }) => {
	return (
		<>
			<h1>Finished Boards</h1>
			<h4>{theme}</h4>
			{boards.map((board) => (
				<>
					<hr
						key={board.boardId + 'hr'}
						style={{ width: '70%', marginTop: '2rem' }}
					/>
					<h3 key={board.boardId + 'title'}>{`board started by: ${
						board?.entries[0]?.userName || board.boardId.slice(0, 7)
					}`}</h3>
					<Board
						board={board}
						key={board.boardId}
						theme={theme}
						currentRound={currentRound}
						handleNext={() => {}}
						allUsers={allUsers}
						handleInput={handleInput}
						msTimer={undefined}
						restartAll={restartAll}
					/>
				</>
			))}
			<div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
				<button onClick={restartAll}>reset</button>
			</div>
		</>
	);
};
