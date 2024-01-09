export type Entry = { userId: string; userName: string; terms: string[] };

export type BoardObj = {
	boardId: string; // The id will be the same of the first user of this board
	readyForNextRound: boolean; // indicates user is ready and their input is disabled
	entries: Entry[]; // Each Entry is the result of an user's participation in a round
};
