// userController.js
const { google } = require('googleapis');
const credentials = require('../credentials.json');

const client = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/spreadsheets']
);

const gsapi = google.sheets({ version: 'v4', auth: client });

const checkUser = async () => {
    const opt = {
        spreadsheetId: '1H_NyAFtZCiPGAl8St991ub6XiVSwiASIuXe8xSqR0Mo',
        range: 'active_employees!A2:G'
    };

    try {
        const response = await gsapi.spreadsheets.values.get(opt);
        return response.data.values;
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await checkUser();

        console.log({
            sheetData: data,
            credentials: [email, password]
        });

        const userData = data.find(row => row[0] === email && row[1] === password);

        if (userData) {
            const userInfo = {
                email: userData[0],
                password: userData[1],
                user_id: userData[2],
                first_name: userData[3],
                last_name: userData[4],
                designation: userData[5],
                profile_img: userData[6]
            };
            console.log(userInfo);
            res.status(200).send({ message: "Login successful", userData: userInfo });
        }
        else {
            res.status(401).send({ message: "Invalid credentials" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal server error" });
    }
};




const appendStory = async (storyData, io) => {
    try {
        await gsapi.spreadsheets.values.append({
            spreadsheetId: '1H_NyAFtZCiPGAl8St991ub6XiVSwiASIuXe8xSqR0Mo',
            range: 'pitched_stories!A2:G',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[
                    storyData.story_id,
                    storyData.story_headline,
                    storyData.story_url,
                    storyData.beats,
                    new Date(storyData.pitched_at).toISOString(),
                    storyData.author_name,
                    storyData.story_status
                ]]
            }
        });
        io.emit("newStory", storyData)
        return true
    }
    catch (error) {
        console.log("Error:", error);
        return false
    }
};


exports.storyPtiched = async (req, res) => {
    try {
        const storyData = req.body;
        console.log("data received from client", storyData);
        const response = await appendStory(storyData, req.io); // Pass io from req
        console.log(response)
        if (response) {
            res.status(200).send({ message: "story added successfully" });
        }
        else {
            res.status(500).send({ message: "Internal server error" });
        }
    }
    catch (err) {
        console.error('Error:', err);
        res.status(500).send({ message: "Internal server error" });
    }
};



const readAllStories = async () => {
    const opt = {
        spreadsheetId: '1H_NyAFtZCiPGAl8St991ub6XiVSwiASIuXe8xSqR0Mo',
        range: 'pitched_stories!A1:G'
    };

    try {
        const response = await gsapi.spreadsheets.values.get(opt);
        const rows = response.data.values;

        if (!rows.length) {
            throw new Error('No data found in the sheet');
        }

        const headers = rows[0];

        const stories = rows.slice(1).map(row => {
            let story = {};
            headers.forEach((header, index) => {
                story[header] = row[index] || '';
            });
            return story;
        });

        return stories;
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
};




exports.getAllStory = async (req, res) => {
    console.log("this function is running")
    try {
        const response = await readAllStories(); // Pass io from req
        console.log("all stories from sheet", response)
        if (response) {
            res.status(200).send({ response });
        }
        else {
            res.status(500).send({ message: "Internal server error" });
        }
    }
    catch (err) {
        console.error('Error:', err);
        res.status(500).send({ message: "Internal server error" });
    }
};


