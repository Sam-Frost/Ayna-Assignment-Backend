const STRAPI_TOKEN = "f0fc4e88355eccfdde3959332ef43e280257af86016f9e1362c1409626d2b6c45fbe7e14ef406bc89d3d47860619b8d11018373b39696197fa9c0a5affef871039e097b819c4458e855330e4f81f55edd9eca3a9b153272ed0c621003dcaaca2b069580a29ad7dabcaa6f7cd7c6a535e843012d4ccfa2f15d6f83645a3eea7f5";

module.exports = ({ env }) => ({
	io: {
	  enabled: true,
	  config: {
		// This will listen for all supported events on the article content type
		contentTypes: ['api::message.message'],
		events: [
		  {
			name: 'connection',
			handler: ({ strapi }, socket) => {
			  // Log when a new client connects
			  strapi.log.info(`[io] a new client with id ${socket.id} has connected`);
  

			  socket.on('disconnect', () => {
				strapi.log.info(`[io] client with id ${socket.id} has disconnected`);
			  });
			},
		  },
		  {
			name: 'chat-message',
			handler: async ({ strapi }, socket, data) => {
			  strapi.log.info(`[io] received chat-message from socket ${socket.id}: ${JSON.stringify(data)}`);
			  
			  try {
				// Store data in the database
				console.log("data.message", data.message)
				// const message = await strapi.service("api::message.message").create({
				//   content: {
				// 	...data.message,
				// 	"publishedAt": new Date()
				//   }
				//    // Assuming 'message' is the key in your data
				//   // You can add more fields as per your message schema
				// });

				const sendData = {
					"data" : {
						...data.message
					}
				}
		  
				const requestOptions = {
					method: 'POST',
					headers: { 'Content-Type': 'application/json',
						'Authorization': `Bearer ${STRAPI_TOKEN}`,
					 },
					body: JSON.stringify(sendData),
				  };
			  
				  fetch('http:localhost:1337/api/messages', requestOptions)
					.then((response) => response.json())
					.then((data) => {
					  console.log('Post successful:', {"sender": "server", data});
					  // Echo the message back to the client
						socket.emit('chat-message.response', {"sender": "server", "data" : data.data});
					})
					.catch((error) => {
					  console.error('Error posting data:', error);
					  // Handle error
					});
			

				strapi.log.info(`[io] message saved to database: ${JSON.stringify(data.message)}`);
		  
				// // Echo the message back to the client
				// socket.emit('chat-message.response', {
				//   message: `Received: ${JSON.stringify(data)}`,
				//   timestamp: new Date(),
				// });
			  } catch (err) {
				strapi.log.error(`[io] error saving message to database: ${err.message}`);
				// Handle error as needed
			  }
			},
		  }
		],
		socket: {
		  serverOptions: {
			cors: {
			  origin: ['https://ayna.samarthnegi.xyz'], // Replace with your client URL
			//   origin: ['http://localhost:3000'], // Replace with your client URL
			//   origin: ['http://127.0.0.1:5500', "http://localhost:3000/"], // Replace with your client URL
			  methods: ['GET', 'POST'],
			  allowedHeaders: ['Content-Type'],
			  credentials: true,
			},
		  },
		},
	  },
	},
  });
  
