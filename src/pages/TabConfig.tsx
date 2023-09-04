import { useEffect } from 'react';
import * as teamsJS from '@microsoft/teams-js';
export const TabConfig = () => {
	useEffect(() => {
		teamsJS.pages.config.registerOnSaveHandler((e) => {
			teamsJS.pages.config.setConfig({
				suggestedDisplayName: 'D Brainwrite',
				contentUrl: `${window.location.href}sidepanel`,
			});
			e.notifySuccess();
		});
		teamsJS.pages.config.setValidityState(true);
	}, []);
	return (
		<>
			<h1 style={{ textAlign: 'center' }}>
				Click save to add app to this meeting
			</h1>
			<div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'center', padding: '3rem' }}>
				<img
					style={{ height: '100%' }}
					src='../../TeamsAppPackage/color.png'
					alt='D Brainwrite Tool logo'
				/>
			</div>
		</>
	);
};
