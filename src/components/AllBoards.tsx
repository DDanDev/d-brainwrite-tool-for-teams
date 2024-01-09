import { FC, useEffect, useState } from 'react';
import { Board } from './Board';
import { BoardObj } from '../types/Board';
import { User } from '../types/User';
import { ChangeEventHandler } from 'react';

export const AllBoards: FC<{
	theme: string;
	boards: ReadonlyMap<string, BoardObj>;
	restartAll: () => void;
	allUsers: User[];
	handleInput: ChangeEventHandler<HTMLInputElement>;
}> = ({ theme, boards, restartAll, allUsers, handleInput }) => {
	const [boardsArray, setBoardsArray] = useState<BoardObj[]>([]);
	useEffect(() => {
		const makeBoardsArray: BoardObj[] = [];
		boards.forEach((board) => {
			makeBoardsArray.push(board);
		});
		setBoardsArray(makeBoardsArray);
	}, [boards]);

	return (
		<>
			<h1>Finished Boards</h1>
			<h4>{theme}</h4>
			{boardsArray.map((board) => (
				<>
					<hr key={board.boardId + 'hr'} style={{ width: '70%', marginTop: '1.5rem' }} />
					<h3 key={board.boardId + 'title'}>{`board started by: ${
						board?.entries[0]?.userName || board.boardId.slice(0, 7)
					}`}</h3>
					<Board
						board={board}
						key={board.boardId}
						allUsers={allUsers}
						handleInput={handleInput}
						msTimer={undefined}
					/>
				</>
			))}
			<div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
				<button onClick={restartAll}>Start Over</button>
			</div>
		</>
	);
};
