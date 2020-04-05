import { useState, useEffect } from 'react';
import { useCamera } from '@ionic/react-hooks/camera';
import { useFilesystem, base64FromPath } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';
import { isPlatform } from '@ionic/react';
import {
	CameraResultType,
	CameraSource,
	CameraPhoto,
	Capacitor,
	FilesystemDirectory,
} from '@capacitor/core';

const PHOTO_STORAGE = 'photos';

export interface Photo {
	filepath: string;
	webviewPath?: string;
	base64?: string;
}

export const usePhotoGallery = () => {
	const { getPhoto } = useCamera();
	const [photos, setPhotos] = useState<Photo[]>([]);
	const { deleteFile, getUri, readFile, writeFile } = useFilesystem();
	const { get, set } = useStorage();

	useEffect(() => {
		const loadSaved = async () => {
			const photosString = await get('photos');
			const photos = (photosString ? JSON.parse(photosString) : []) as Photo[];
			for (let photo of photos) {
				const file = await readFile({
					path: photo.filepath,
					directory: FilesystemDirectory.Data,
				});

				// On web, we must read each image from the Filesystem
				// into base64 format, using a new base64 property on the Photo object
				photo.base64 = `data:image/jpeg;base64,${file.data}`;
			}
			setPhotos(photos);
		};
		loadSaved();
	}, [get, readFile]);

	// Save photo to File System
	const savePhoto = async (photo: CameraPhoto, fileName: string) => {
		const base64Data = await base64FromPath(photo.webPath!);
		await writeFile({
			path: fileName,
			data: base64Data,
			directory: FilesystemDirectory.Data,
		});
		return getPhotoFile(photo, fileName);
	};

	// Take a photo from device camera
	const takePhoto = async () => {
		// Take photo
		const cameraPhoto = await getPhoto({
			resultType: CameraResultType.Uri,
			source: CameraSource.Camera,
			quality: 100,
		});

		// Save photo to file system
		const fileName = new Date().getTime() + '.jpeg';
		const savedFileImage = await savePhoto(cameraPhoto, fileName);

		// Update state to include saved photo
		const newPhotos = [savedFileImage, ...photos];
		setPhotos(newPhotos);

		// Save photo data into array each time is taken to persist data even if app close
		set(
			PHOTO_STORAGE,
			JSON.stringify(
				newPhotos.map((p) => {
					// Don't save the base64 representation of the photo data,
					// since it's already saved on the Filesystem
					const photoCopy = { ...p };
					delete photoCopy.base64;
					return photoCopy;
				}),
			),
		);
	};

	const getPhotoFile = async (
		cameraPhoto: CameraPhoto,
		fileName: string,
	): Promise<Photo> => {
		return {
			filepath: fileName,
			webviewPath: cameraPhoto.webPath,
		};
	};

	return {
		photos,
		takePhoto,
	};
};
