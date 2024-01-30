// Creaet Feature
function itemTemplate(text, id) {
	return `<li 
    class="list-group-item list-group-item-action d-flex align-items-center justify-content-between"
>
    <span class="item-text">${text}</span>
    <div>
        <button data-id=${id} class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
        <button data-id=${id} class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
</li>`;
}

// Initrial Page Load Render
let ourHtml = jsonItems
	.map(function (item) {
		return itemTemplate(item.text, item._id);
	})
	.join("");
document.getElementById("item-list").insertAdjacentHTML("beforeend", ourHtml);

// Create Feature
let createField = document.getElementById("create-field");

document.getElementById("create-form").addEventListener("submit", function (e) {
	e.preventDefault();

	console.log("Inside create-form: " + e.target.item.value);
	axios
		.post("/create-item", { text: createField.value })
		.then(function (response) {
			// create the HTML for a new item
			console.log("Inside create-item response.data: " + response.data);
			document
				.getElementById("item-list")
				.insertAdjacentHTML(
					"beforeend",
					itemTemplate(e.target.item.value, response.data._id)
				);
			e.target.item.value = "";
			e.target.item.focus();
		})
		.catch(function () {
			console.error("Please try again later.");
		});
});

document.addEventListener("click", function (e) {
	if (e.target.classList.contains("edit-me")) {
		let placeholder =
			e.target.parentElement.parentElement.querySelector(
				".item-text"
			).innerHTML;
		let userInput = prompt("Enter your desired new text", placeholder);
		if (userInput) {
			axios
				.post("/update-item", {
					text: userInput,
					id: e.target.getAttribute("data-id"),
				})
				.then(function () {
					e.target.parentElement.parentElement.querySelector(
						".item-text"
					).innerHTML = userInput;
				})
				.catch(function () {
					console.error("Please try again later.");
				});
		}
	}
	if (e.target.classList.contains("delete-me")) {
		if (confirm("Do you really want to delete this item permanently?")) {
			axios
				.post("/delete-item", { id: e.target.getAttribute("data-id") })
				.then(function () {
					e.target.parentElement.parentElement.remove();
				})
				.catch(function () {
					console.error("Please try again later.");
				});
		}
	}
});
