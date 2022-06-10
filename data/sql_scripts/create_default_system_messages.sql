INSERT INTO message (name, title, type, `from`, label, body, send_by, created_by, created_at, updated_by, updated_at) VALUES 
("New Starter Week 1", "Well done on completing your first week!", "SYSTEM_DEFAULT", "Site Manager", "new_starter_week_1", "[[{\"data\":\"We are so pleased to have you onboard and hope you enjoyed your first week. We would love to hear your feedback so please complete the new starter survey as your opinion matters to us!\",\"type\":\"text\"},{\"data\":{\"id\": null,\"name\":\"New Starter Week 1 Survey\"},\"type\":\"survey\"},{\"data\":\"http://app.test.theclearvue.co.uk/static/media/Logo_White.44c46ed44385f9b3159e.png\",\"type\":\"media\"}]]", 1, 1, NOW(), 1, NOW()),

("New Starter Week 2", "Well done on completing your first 2 weeks!", "SYSTEM_DEFAULT", "Site Manager", "new_starter_week_2", "[[{\"data\":\"We are so pleased to have you onboard and hope your first 2 weeks have been enjoyable. We would love to hear your feedback so please complete the new starter survey as your opinion matters to us!\",\"type\":\"text\"},{\"data\":{\"id\": null,\"name\":\"New Starter Week 2 Survey\"},\"type\":\"survey\"},{\"data\":\"http://app.test.theclearvue.co.uk/static/media/Logo_White.44c46ed44385f9b3159e.png\",\"type\":\"media\"}]]", 1, 1, NOW(), 1, NOW()),

("New Starter Week 4", "You have successfully completed 4 weeks", "SYSTEM_DEFAULT", "Site Manager", "new_starter_week_4", "[[{\"data\":\"Well done on your first 4 weeks with you and we would like to thank you for your loyalty.  We would love to hear your feedback so please complete the 4 week survey as your opinion matters to us!\",\"type\":\"text\"},{\"data\":{\"id\": null,\"name\":\"New Starter Week 4 Survey\"},\"type\":\"survey\"},{\"data\":\"http://app.test.theclearvue.co.uk/static/media/Logo_White.44c46ed44385f9b3159e.png\",\"type\":\"media\"}]]", 1, 1, NOW(), 1, NOW()),

("New Starter Week 8", "You have successfully completed 8 weeks", "SYSTEM_DEFAULT", "Site Manager", "new_starter_week_8", "[[{\"data\":\"Well done on your first 8 weeks with you and we would like to thank you for your loyalty.  We would love to hear your feedback so please complete the 8 week survey as your opinion matters to us!\",\"type\":\"text\"},{\"data\":{\"id\": null,\"name\":\"New Starter Week 8 Survey\"},\"type\":\"survey\"},{\"data\":\"http://app.test.theclearvue.co.uk/static/media/Logo_White.44c46ed44385f9b3159e.png\",\"type\":\"media\"}]]", 1, 1, NOW(), 1, NOW()),

("New Starter Week 12", "You have successfully completed 12 weeks", "SYSTEM_DEFAULT", "Site Manager", "new_starter_week_12", "[[{\"data\":\"Well done on your first 12 weeks with you and we would like to thank you for your loyalty.  We would love to hear your feedback so please complete the 12 week survey as your opinion matters to us!\",\"type\":\"text\"},{\"data\":{\"id\": null,\"name\":\"New Starter Week 12 Survey\"},\"type\":\"survey\"},{\"data\":\"http://app.test.theclearvue.co.uk/static/media/Logo_White.44c46ed44385f9b3159e.png\",\"type\":\"media\"}]]", 1, 1, NOW(), 1, NOW()),

("Annual work anniversary", "Thank you for your loyalty!", "SYSTEM_DEFAULT", "Site Manager", "annual_work_anniversary", "[[{\"data\":\"We are so pleased to have you as a member of our team and thank you for your loyalty. We would love to hear your feedback so please complete the new starter survey as your opinion matters to us!\",\"type\":\"text\"},{\"data\":{\"id\": null,\"name\":\"General Survey\"},\"type\":\"survey\"},{\"data\":\"https://clearvue-static.s3.eu-west-2.amazonaws.com/messages/annual_service_message.jpg\",\"type\":\"media\"}]]", 1, 1, NOW(), 1, NOW()),

("Birthday wishes", "Happy Birthday!", "SYSTEM_DEFAULT", "Site Manager", "birthday_wishes", "[[{\"data\":\"Hey, we just wanted to wish you a happy birthday and to let you know we really appreciate everything you do! Big thanks.\",\"type\":\"text\"},{\"data\":\"https://clearvue-static.s3.eu-west-2.amazonaws.com/messages/birthday_message.jpg\",\"type\":\"media\"}]]", 1, 1, NOW(), 1, NOW()),

("First day Welcome Message", "Good luck in your new role", "SYSTEM_DEFAULT", "Site Manager", "first_day_welcome", "[[{\"data\":\"We are so pleased you have chosen to work with us and hope you have a great first day in your new role.\",\"type\":\"text\"},{\"data\":\"https://clearvue-static.s3.eu-west-2.amazonaws.com/messages/welcome_message.jpg\",\"type\":\"media\"}]]", 1, 1, NOW(), 1, NOW()),

("Unassigned Worker", "We hope you’re OK!", "SYSTEM_DEFAULT", "Site Manager", "unassign_worker", "[[{\"data\":\"We see that your status within your profile has changed to ‘Unassigned’. We are sorry to hear you are leaving us and appreciate everything you did, so please complete the survey. We hope to see you again in the future.\",\"type\":\"text\"},{\"data\":{\"id\": null,\"name\":\"Exit Survey\"},\"type\":\"survey\"},{\"data\":\"http://app.test.theclearvue.co.uk/static/media/Logo_White.44c46ed44385f9b3159e.png\",\"type\":\"media\"}]]", 1, 1, NOW(), 1, NOW()),

("Zero Hours", "We hope you’re OK!", "SYSTEM_DEFAULT", "Site Manager", "zero_hours", "[[{\"data\":\"We have no hours recorded for you this week. Is that right? If not, please complete the survey in the link below so we can help resolve this.\",\"type\":\"text\"},{\"data\":{\"id\": null,\"name\":\"Worker Survey\"},\"type\":\"survey\"},{\"data\":\"http://app.test.theclearvue.co.uk/static/media/Logo_White.44c46ed44385f9b3159e.png\",\"type\":\"media\"}]]", 1, 1, NOW(), 1, NOW());


UPDATE message SET body = JSON_SET(body, '$[0][1].data.id', (SELECT id FROM survey WHERE name='New Starter Survey - Week 1')) WHERE label='new_starter_week_1';
UPDATE message SET body = JSON_SET(body, '$[0][1].data.id', (SELECT id FROM survey WHERE name='New Starter Survey - Week 2')) WHERE label='new_starter_week_2';
UPDATE message SET body = JSON_SET(body, '$[0][1].data.id', (SELECT id FROM survey WHERE name='New Starter Survey - Week 4')) WHERE label='new_starter_week_4';
UPDATE message SET body = JSON_SET(body, '$[0][1].data.id', (SELECT id FROM survey WHERE name='New Starter Survey - Week 8')) WHERE label='new_starter_week_8';
UPDATE message SET body = JSON_SET(body, '$[0][1].data.id', (SELECT id FROM survey WHERE name='New Starter Survey - Week 12')) WHERE label='new_starter_week_12';
UPDATE message SET body = JSON_SET(body, '$[0][1].data.id', (SELECT id FROM survey WHERE name='General Survey')) WHERE label='annual_work_anniversary';
UPDATE message SET body = JSON_SET(body, '$[0][1].data.id', (SELECT id FROM survey WHERE name='Exit Survey')) WHERE label='unassign_worker';
UPDATE message SET body = JSON_SET(body, '$[0][1].data.id', (SELECT id FROM survey WHERE name='Worker Survey')) WHERE label='zero_hours';
