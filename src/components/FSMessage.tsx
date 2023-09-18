import { FC } from 'react';

export const FSMessage: FC<{ text: string }> = ({ text }) => {
	return <h1>{text}</h1>;
};
