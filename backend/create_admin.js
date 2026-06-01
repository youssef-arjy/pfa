const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const existingAdmin = await User.findOne({ email: 'admin@amazigh.com' });
        if (existingAdmin) {
            console.log('L\'administrateur existe déjà.');
            process.exit(0);
        }

        await User.create({
            name: 'Admin',
            email: 'admin@amazigh.com',
            password: 'bouchnaj24?', // Remplacez par un mot de passe fort plus tard
            role: 'admin'
        });

        console.log('Administrateur créé avec succès ! Email: admin@amazigh.com | MDP: bouchnaj24?');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createAdmin();
