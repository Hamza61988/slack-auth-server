const axios = require('axios');

module.exports = async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send("❌ Error: Missing code. Please try clicking the link in Discord again.");
    }

    try {
        const response = await axios.post('https://slack.com/api/oauth.v2.access', null, {
            params: {
                client_id: process.env.SLACK_CLIENT_ID,
                client_secret: process.env.SLACK_CLIENT_SECRET,
                code: code,
                redirect_uri: process.env.SLACK_REDIRECT_URI
            }
        });

        const data = response.data;

        if (!data.ok) {
            return res.send(`<h1>❌ Error from Slack</h1><p>${data.error}</p>`);
        }

        const accessToken = data.access_token;
        const teamName = data.team.name;

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Slack Connected</title>
            <style>
                body { font-family: sans-serif; background: #1a1a1a; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; flex-direction: column; text-align: center; }
                .box { background: #2b2b2b; padding: 2rem; border-radius: 10px; border: 1px solid #444; max-width: 600px; }
                code { background: #000; color: #00ff00; padding: 15px; display: block; margin: 20px 0; border-radius: 5px; word-break: break-all; font-size: 1.2rem; cursor: pointer; }
                p { color: #ccc; }
                h1 { color: #fff; }
            </style>
        </head>
        <body>
            <div class="box">
                <h1>✅ Connected to ${teamName}!</h1>
                <p>Since your bot is on a different server, you need to manually save this token.</p>
                <p><strong>Click the green command below to copy it:</strong></p>
                
                <code id="cmd" onclick="copyCmd()">/save_slack_token token:${accessToken} team_name:${teamName}</code>
                
                <p>Now go back to Discord and paste this!</p>
            </div>
            <script>
                function copyCmd() {
                    const el = document.getElementById('cmd');
                    navigator.clipboard.writeText(el.innerText).then(() => {
                        alert("Copied! Go paste it in Discord.");
                    });
                }
            </script>
        </body>
        </html>
        `;

        res.setHeader('Content-Type', 'text/html');
        res.send(html);

    } catch (error) {
        console.error("OAuth Error:", error);
        res.status(500).send("Internal Server Error.");
    }
};