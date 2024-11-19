import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import config from '../env/config.js';

    cloudinary.config({ 
        cloud_name: config.cloudinaryCloudName, 
        api_key: config.cloudinaryApiKey, 
        api_secret: config.cloudinaryApiSecret, 
    });   


    const uploadTOCloudinary = async(file,folder) => {
        try {
            if(!file) return null;
            const uploadResult = await cloudinary.uploader.upload(file,{
                resource_type: 'auto',
                folder:`${folder}`
            });
            fs.unlinkSync(file);
            return uploadResult;
        } catch (error) {
            fs.unlinkSync(file);
            return null;
        }
    }


    const deleteFromCloudinary = async(publicId,folder,resource_type) => {
        try {
            if(!publicId) return null;
            const deleteResult = await cloudinary.uploader.destroy(`${folder}/${publicId}`,
            {
                resource_type: resource_type === 'video' ? 'video' : 'image'
            }
            );
            return deleteResult;
        } catch (error) {
            return null;
        }
    }

    export {uploadTOCloudinary,deleteFromCloudinary};