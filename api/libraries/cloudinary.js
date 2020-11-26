import cloudinaryModule from 'cloudinary';

const cloudinary = cloudinaryModule.v2;
cloudinary.config({
    cloud_name: 'dwanhoixw',
    api_key: '476458331174335',
    api_secret: 'gBS5b7g-EgPX0iSlEOhKabTyh8Q'
});

module.exports = cloudinary