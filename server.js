let express = require("express");
let { MongoClient, ObjectId } = require("mongodb");
let sanitizeHTML = require("sanitize-html");

let app = express();
let db;

// Set up the middleware for serving static files
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passwordProtected);

async function initDb() {
	let client = new MongoClient(
		"mongodb://root:root@localhost:27017/TodoApp?&authSource=admin"
	);
	await client.connect();
	console.log("Connected successfully to MongoDB server");
	db = client.db();
	app.listen(3000, async function () {
		console.log("server running on port 3000");
	});
}

initDb();

function passwordProtected(req, res, next) {
	res.set("WWW-Authenticate", 'Basic realm="Simple Todo App"');
	console.log("Authorization" + req.headers.authorization);
	if (req.headers.authorization == "Basic YWRtaW46YWRtaW4=") {
		console.log("Authorized");
		next();
	} else {
		res.status(401).send("Authentication required");
	}
}

app.get("/", async function (req, res) {
	let itemsCollection = db.collection("items");
	const allItems = await itemsCollection.find().toArray();

	res.send(`
    <!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Simple To-Do App</title>
		<link
			rel="stylesheet"
			href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css"
			integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS"
			crossorigin="anonymous"
		/>
	</head>
	<body>
		<div class="container">
			<h1 class="display-4 text-center py-1">To-Do App</h1>

			<div class="jumbotron p-3 shadow-sm">
				<form id="create-form" action="/create-item" method="POST">
					<div class="d-flex align-items-center">
						<input
                            id="create-field"
							name="item"
							autofocus
							autocomplete="off"
							class="form-control mr-3"
							type="text"
							style="flex: 1"
						/>
						<button class="btn btn-primary">Add New Item</button>
					</div>
				</form>
			</div>

			<ul id="item-list" class="list-group pb-5">
			</ul>
		</div>
        
		<script> 
		let jsonItems = ${JSON.stringify(allItems)}
		</script>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.1.2/dist/axios.min.js"></script>
        <script src="/browser.js"></script>
	</body>
</html>

    `);
});

app.post("/create-item", async function (req, res) {
	try {
		console.log("Inside create-item: " + req.body.item);

		let itemsCollection = db.collection("items");

		let safeText = sanitizeHTML(req.body.text, {
			allowedTags: [],
			allowedAttributes: {},
		});
		const result = await itemsCollection.insertOne({ text: safeText });

		console.log(`A document was inserted with the _id: ${result.insertedId}`);
		res.json({ _id: result.insertedId, text: safeText });
	} catch (error) {
		console.log(error);
		res.send("Error: " + error);
	}
});

app.post("/update-item", async function (req, res) {
	try {
		let itemsCollection = db.collection("items");
		
		let safeText = sanitizeHTML(req.body.text, {
			allowedTags: [],
			allowedAttributes: {},
		});
		const result = await itemsCollection.updateOne(
			{ _id: new ObjectId(req.body.id) },
			{ $set: { text: safeText } }
		);

		console.log(`A document was updated with the _id: ${result.insertedId}`);
		// res.send("You just called the post method at!\n");
		res.send("Success");
	} catch (error) {
		console.log(error);
		res.send("Error: " + error);
	}
});

app.post("/delete-item", async function (req, res) {
	try {
		let itemsCollection = db.collection("items");

		const result = await itemsCollection.deleteOne({
			_id: new ObjectId(req.body.id),
		});

		console.log(`A document was deleted with the _id: ${result.insertedId}`);
		// res.send("You just called the post method at!\n");
		res.send("Success");
	} catch (error) {
		console.log(error);
		res.send("Error: " + error);
	}
});
