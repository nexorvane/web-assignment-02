$(document).ready(function () {
    // Show a loading message and load the product list from products.json.
    const $status = $("#loadMessage");
    $status.text("Loading products...").addClass("loading").show();

    $.getJSON("products.json")
        .done(function (data) {
            products = data;

            if ($("#productGrid").length) {
                updateProductList();
            } else if ($("#featuredProducts").length) {
                displayProducts(products.slice(0, 3));
            }

            // Make the product cards appear with a small fade effect.
            $(".product-card").hide().fadeIn(350);
            $status.text("").removeClass("loading error-message");
            renderCart();
        })
        .fail(function () {
            $status.text("Products could not load. Please open this project with Live Server.")
                .removeClass("loading")
                .addClass("error-message")
                .show();

            // Use the product array in store.js as a backup if the JSON file cannot load.
            if ($("#productGrid").length) {
                displayProducts(products);
            } else if ($("#featuredProducts").length) {
                displayProducts(products.slice(0, 3));
            }
            $(".product-card").hide().fadeIn(350);
            renderCart();
        });

    // Open or close each FAQ answer with jQuery.
    $(document).on("click", ".faq-question", function () {
        $(this).toggleClass("active");
        $(this).next(".faq-answer").stop(true, true).slideToggle(200);
    });

    // Apply the saved theme and let the theme button switch between light and dark.
    if (localStorage.getItem("shopEasyTheme") === "dark") {
        $("body").addClass("dark-theme");
        $("#themeButton").text("Light Mode").addClass("active");
    }

    $("#themeButton").on("click", function () {
        $("body").toggleClass("dark-theme");
        const darkModeOn = $("body").hasClass("dark-theme");
        $(this).text(darkModeOn ? "Light Mode" : "Dark Mode").toggleClass("active");
        localStorage.setItem("shopEasyTheme", darkModeOn ? "dark" : "light");
    });
});
