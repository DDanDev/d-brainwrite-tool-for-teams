import { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TabConfig } from './pages/TabConfig';
import { MeetingStage } from './pages/MeetingStage';
import { SidePanel } from './pages/SidePanel';
import * as teamsJs from '@microsoft/teams-js';
import { LiveShareProvider } from '@microsoft/live-share-react';
import './App.scss';

function App() {
	const startedInitilize = useRef(false);
	const [inTeams, setInTeams] = useState(false);
	const [host, setHost] = useState<null | teamsJs.LiveShareHost>(null);

	useEffect(() => {
		if (startedInitilize.current === true) return;

		(async () => {
			try {
				await teamsJs.app.initialize();
				const context = await teamsJs.app.getContext();
				if (context.page.frameContext === 'meetingStage') setHost(teamsJs.LiveShareHost.create());
				setInTeams(true);
				teamsJs.app.notifyAppLoaded();
				teamsJs.app.notifySuccess();
			} catch (err: any) {
				console.error(err);
			}
		})();
	}, []);

	return (
		<>
			{!inTeams ? (
				<>
					<h1 style={{textAlign: 'center'}}>This app can only run in Microsoft Teams. For now</h1>
					<div
						style={{
							flex: '1 1 0',
							display: 'flex',
							justifyContent: 'center',
							padding: '3rem',
							maxHeight: '25rem'
						}}
					>
						<img
							style={{ height: '100%' }}
							src='../../TeamsAppPackage/color.png'
							alt='D Brainwrite Tool logo'
						/>
					</div>
				</>
			) : (
				<BrowserRouter>
					<Routes>
						<Route path='/' element={<TabConfig />} />
						<Route
							path='/stage'
							element={
								<LiveShareProvider joinOnLoad host={host!}>
									<MeetingStage />
								</LiveShareProvider>
							}
						/>
						<Route path='/sidepanel' element={<SidePanel />} />
					</Routes>
				</BrowserRouter>
			)}
		</>
	);
}

export default App;
