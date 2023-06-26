import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';

@Injectable()
export class FileSystemService {
    async downloadAvatarImage(
        imagePath: string,
        imageUrl: string,
        imageName: string,
    ) {
        try {
            const response = await axios.get(imageUrl, {
                responseType: 'stream',
            });

            const writer = fs.createWriteStream(`${imagePath}/${imageName}`);

            await response.data.pipe(writer);
        } catch (error) {
            console.log('Error download image locally', error);
        }
    }

    downloadImageToBase64 = async (url: string): Promise<string> => {
        try {
            const response = await axios.get(url, {
                responseType: 'arraybuffer',
            });
            const buffer = Buffer.from(response.data, 'binary');
            const base64 = buffer.toString('base64');
            return base64;
        } catch (error) {
            console.log('Error conveter image to base 64', error);
        }
    };

    verifyAvatarUrl(imagePath: string, imageName: string): boolean {
        try {
            const path = `${imagePath}/${imageName}`;
            if (fs.existsSync(path)) {
                console.log('Image already exists locally.');
                return true;
            }
            console.log('Image not exists locally.');
            return false;
        } catch (error) {
            console.log('Error verify image locally', error);
        }
    }

    deleteImage(imagePath: string, imageName: string) {
        try {
            const path = `${imagePath}/${imageName}`;
            fs.unlinkSync(path);
            console.log('Deleting image locally');
        } catch {}
    }
}
