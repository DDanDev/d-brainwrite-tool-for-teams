import * as teamsJS from '@microsoft/teams-js';

export const SidePanel = () => {
	return (
		<>
			<img src='../../TeamsAppPackage/color.png' alt='D Brainwrite Tool logo' />
			<button
				onClick={() =>
					teamsJS.meeting.shareAppContentToStage(() => {
						return;
					}, `${window.location.origin}/stage`)
				}
			>
				Start a brainwriting session!
			</button>
		</>
	);
};
