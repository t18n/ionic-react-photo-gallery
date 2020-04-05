import React from 'react';
import ExploreContainer from '../components/ExploreContainer';
import './Gallery.css';
import { camera, trash, close } from 'ionicons/icons';
import { usePhotoGallery } from '../hooks/usePhotoGallery';
import {
	IonContent,
	IonHeader,
	IonPage,
	IonTitle,
	IonToolbar,
	IonFab,
	IonFabButton,
	IonIcon,
	IonGrid,
	IonRow,
	IonCol,
	IonImg,
	IonActionSheet,
} from '@ionic/react';

const Gallery: React.FC = () => {
	const { takePhoto, photos } = usePhotoGallery();

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Gallery</IonTitle>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">Gallery</IonTitle>
					</IonToolbar>
				</IonHeader>
				<IonGrid>
					<IonRow>
						{photos.map((photo, index) => (
							<IonCol size="6" key={index}>
								<IonImg src={photo.base64 ?? photo.webviewPath} />
							</IonCol>
						))}
					</IonRow>
				</IonGrid>
				<IonFab vertical="bottom" horizontal="center" slot="fixed">
					<IonFabButton onClick={() => takePhoto()}>
						<IonIcon icon={camera}></IonIcon>
					</IonFabButton>
				</IonFab>
			</IonContent>
		</IonPage>
	);
};

export default Gallery;
