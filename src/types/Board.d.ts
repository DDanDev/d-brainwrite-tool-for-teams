export type Entry = { userId: string; userName: string; terms: string[] };

export type BoardObj = {
	entries: Entry[];
	readyForNextRound: boolean;
	boardId: string;
};
