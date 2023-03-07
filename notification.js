const nodemailer = require('nodemailer');
const mustache = require('mustache');
const fs = require('fs');
const axios = require('axios');

const XSS_PAYLOAD_FIRE_EMAIL_TEMPLATE = fs.readFileSync(
	'./templates/xss_email_template.htm',
	'utf8'
);

async function send_email_notification(xss_payload_fire_data) {
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: parseInt(process.env.SMTP_PORT),
		secure: (process.env.SMTP_USE_TLS === "true"),
		auth: {
			user: process.env.SMTP_USERNAME,
			pass: process.env.SMTP_PASSWORD,
		},
	});

	const notification_html_email_body = mustache.render(
		XSS_PAYLOAD_FIRE_EMAIL_TEMPLATE, 
		xss_payload_fire_data
	);

	const info = await transporter.sendMail({
		from: process.env.SMTP_FROM_EMAIL,
		to: process.env.SMTP_RECEIVER_EMAIL,
		subject: `[XSS Hunter Express] XSS Payload Fired On ${xss_payload_fire_data.url}`,
		text: "Only HTML reports are available, please use an email client which supports this.",
		html: notification_html_email_body,
	});

	console.log("Message sent: %s", info.messageId);
}
async function send_slack_notification(xss_payload_fire_data) {
	var slack_message = {
		"channel": process.env.SLACK_CHANNEL,
		"username": process.env.SLACK_USERNAME,
		"icon_emoji": `:${process.env.SLACK_EMOJI}:`,
		"blocks": [
			{
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Xss Alert From Xss-Hunter",
                    "emoji": true
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "*Browser Time:*"
                    },
                    {
                        "type": "plain_text",
                        "text": `${xss_payload_fire_date.browser_timestamp}`
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "*Fired On:*"
                    },
                    {
                        "type": "plain_text",
                        "text": `${xss_payload_fire_data.url}`
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "*IP Address:*"
                    },
                    {
                        "type": "plain_text",
                        "text": `${xss_payload_fire_data.ip_address}`
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "*Referer:*"
                    },
                    {
                        "type": "plain_text",
                        "text": `${xss_payload_fire_data.referer}`
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "*Origin:*"
                    },
                    {
                        "type": "plain_text",
                        "text": `${xss_payload_fire_data.origin}`
                    }
                ]
            },
            {
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": "*Fired in iFrame:*"
                    },
                    {
                        "type": "plain_text",
                        "text": `${xss_payload_fire_data.was_iframe}`
                    }
                ]
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Proof Of Concept Screenshot*"
                }
            },
            {
                "type": "image",
                "image_url":`${xss_payload_fire_data.screenshot_url}`,
                "alt_text": "Failed To Load Pic From Server"
            },
            {
                "type": "divider"
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "url": `https://${process.env.HOSTNAME}/admin`,
                        "style": "primary",
                        "text": {
                            "type": "plain_text",
                            "text": "XssHunter Login",
                            "emoji": true
                        },
                        "action_id": "actionId-0"
                    },
                    {
                        "type": "button",
                        "url": `${process.env.CONSOLE_URL}`,
                        "style": "danger",
                        "text": {
                            "type": "plain_text",
                            "text": "Console Login",
                            "emoji": true
                        },
                        "action_id": "actionId-1"
                    }
                ]
            },
		]
	};

	await axios.post(process.env.SLACK_WEBHOOK, JSON.stringify(slack_message));

	console.log("Message sent to slack");
}

module.exports.send_slack_notification = send_slack_notification;
module.exports.send_email_notification = send_email_notification;
