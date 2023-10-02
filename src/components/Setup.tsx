import { FC } from 'react';

export const Setup: FC<{
	disabled: boolean;
	theme: string;
	setTheme: (theme: string) => void;
	rounds: number;
	setRounds: (rounds: number) => void;
	terms: number;
	setTerms: (terms: number) => void;
	timer: number;
	setTimer: (timer: number) => void;
	handleStart: () => void;
}> = ({
	disabled,
	theme,
	setTheme,
	rounds,
	setRounds,
	setTerms,
	terms,
	setTimer,
	timer,
	handleStart,
}) => {
	return (
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
	);
};
