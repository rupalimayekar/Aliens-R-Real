/***********************/
/* Aliens-R-Real       */
/*  Photo by Miriam Espacio on Unsplash */
/***********************/
  
var filteredData = dataSet;
const PAGESIZE = 20;
const MAXPAGELINKS = 10

// Get an array of all the shapes
const uniqueShapes = [...new Set(dataSet.map(data => data.shape))];
const uniqueCountries = [...new Set(dataSet.map(data => data.country))];

console.log(uniqueShapes);
console.log(uniqueCountries);

/**
 * This function renders all the fields in the Filter section of the html page. All fields
 * are added to the div with the "filter-container" id
 */
function renderFilters() {
    $filterPanel = d3.select("#filter-container");
    
    // Add the heading for filters
    $filterPanel.append("h3").text("Filter UFO sightings:");
    
    // Add the date input fields
    $filterPanel.append("label").attr("for", "startDateInput").html("Start Date:&nbsp;");
    $filterPanel.append("input").attr("type", "Date").attr("id", "startDateInput");

    $filterPanel.append("label").attr("for", "endDateInput").html("&nbsp;&nbsp;&nbsp;End Date:&nbsp;");
    $filterPanel.append("input").attr("type", "Date").attr("id", "endDateInput");

    $filterPanel.append("br");
    $filterPanel.append("br");

    // Add the city, state and country input fields
    $filterPanel.append("label").attr("for", "cityInput").html("City:&nbsp;");
    $filterPanel.append("input").attr("type", "text").attr("id", "cityInput");

    $filterPanel.append("label").attr("for", "stateInput").html("&nbsp;&nbsp;&nbsp;State:&nbsp;");
    $filterPanel.append("input").attr("type", "text").attr("id", "stateInput");


    $filterPanel.append("label").attr("for", "countryInput").html("&nbsp;&nbsp;&nbsp;Country:&nbsp;");
    $filterPanel.append("input").attr("type", "text").attr("id", "countryInput");

    $filterPanel.append("br");
    $filterPanel.append("br");

    // Add the Shapes list filter field
    var $shapeList = $filterPanel.append("div").attr("class", "form-group");
    $shapeList.append("label").attr("for", "shapeSelect").text("Shape:");
    var shapeSelect = $shapeList.append("select").attr("class", "form-control").attr("id", "shapeSelect");
    
    // Add values into the list for selection
    shapeSelect.append("option").text("All");
    uniqueShapes.forEach(shape => shapeSelect.append("option").text(shape));

    // Add the filter button
    $filterBtn = $filterPanel.append("buton").text("Filter");
    $filterBtn.attr("class", "btn, btn-primary btn-lg");
    $filterBtn.attr("type", "submit");
    $filterBtn.attr("id", "filterButton");
    $filterBtn.on("click", filterData);

    $filterPanel.append("br");
};

/**
 * This function renders the UFO Sightings data table on initial load and every time the filter
 * button is clicked. The contents of the table are in the filteredData variable. The filteredData
 * is initially set to the complete dataSet array of the data.js file.
 */
function renderDataTable(activePage) {

    console.log("renderDataTable -> PAGE IS ======  " + activePage);

    var totalRowCount = filteredData.length;
    
    // calculate the number of pages we will need to display the data
    var totalPageCount = Math.trunc(totalRowCount/PAGESIZE);
    if (totalRowCount%PAGESIZE != 0) {
        totalPageCount ++;
    }

    console.log("Total number of data rows == " + totalRowCount);
    console.log("Total number of pages == " + totalPageCount);

    var dataColumns = ["Date/Time", "City", "State", "Country", "Shape", "Duration", "Comments"];

    // Clear the existing title, pagination links and table
    $dataContainer = d3.select("#data-container");
    $dataContainer.html("");

    // Add a header for the table
    $dataContainer.append("h2").text("UFO Sightings...");

    /*Add the pagination that looks something like below but with different attributes
    
    <nav aria-label="Page navigation">
    <ul class="pagination">
        <li>
        <a aria-label="Previous" class="disabled">
            <span aria-hidden="true">&laquo;</span>
        </a>
        </li>
        <li><a >1</a></li>
        <li><a >2</a></li>
        <li><a >3</a></li>
        <li><a >4</a></li>
        <li><a >5</a></li>
        <li>
        <a aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
        </a>
        </li>
    </ul>
    </nav>
    */

    $nav = $dataContainer.append("nav").attr("aria-label", "Results Pages");
    $navUL = $nav.append("ul").attr("class", "pagination pagination-sm");
    
    // Prev <<
    $li = $navUL.append("li").attr("data_page", "prev");
    
    // if we are rendering the first page then disable the prev pagination link
    if (activePage == 1) { $li.attr("class", "disabled"); }
    
    // cont Prev <<
    $li.append("a").attr("aria-label", "Previous").
        append("span").attr("aria-hidden", "true").html("&laquo;");
    
    // create an li for each page
    for (var p=1; p<=totalPageCount; p++) {
        // $li= $navUL.append("li").attr("class", "active").attr("data_page","1").append("a").text("1");
        // $li= $navUL.append("li").attr("data_page","2").append("a").text("2");
        $li = $navUL.append("li").attr("data_page", p.toString());
        $li.append("a").text(p.toString());

        // if this is the page that should be active, then highlight it
        if (p == activePage) {
            $li.attr("class", "active");
        }
    }

    // Next >>
    $li= $navUL.append("li").attr("data_page","next");
    
    // if we are rendering the last page then disable the prev pagination link
    if (activePage == totalPageCount) { $li.attr("class", "disabled"); }
    
    // cont Next >>
    $li.append("a").attr("aria-label", "Next").
        append("span").attr("aria-hidden", "true").html("&raquo;");
        
    
    // Add a bootstrap table. Display only the rows in the specific page
    $dataTable = d3.select("#data-container").append("table").attr("id", "data-table"); 
    $dataTable.attr("class", "table table-bordered table-striped table-responsive");
    $th = $dataTable.append("thead");
    $tbody = $dataTable.append("tbody");

    // Add table headers
    for(var i=0; i<7; i++) {
        $th.append("th").text(dataColumns[i]);
    }

    var startRow = PAGESIZE*activePage - PAGESIZE;
    var endRow = PAGESIZE*activePage;

    // to handle the case when the last page has rows fewer than the pagesize
    if (activePage == totalPageCount) {
        endRow = totalRowCount;
    }
    
    console.log("startRow = " + startRow + "  endRow == " + endRow);

    // Add table rows from the filteredData
    for(var rownum=startRow; rownum<endRow; rownum++){
        console.log("rownum == " + rownum);

        $tr = $tbody.append("tr");

        $tr.append("td").text(filteredData[rownum].datetime);
        $tr.append("td").text(filteredData[rownum].city);
        $tr.append("td").text(filteredData[rownum].state);
        $tr.append("td").text(filteredData[rownum].country);
        $tr.append("td").text(filteredData[rownum].shape);
        $tr.append("td").text(filteredData[rownum].durationMinutes);
        $tr.append("td").text(filteredData[rownum].comments);
            
    }

    // set the callback functions on the pagination links
    setCallbacks();
};

/**
 * This function is called when the filter button is clicked. It filters the data as per
 * the filter criteria input and sets the filteredData variable to the filtered data. In the
 * end it calls the function to render the data table.
 */
function filterData() {

    // stop the default submit behavior
    d3.event.preventDefault();

    // This line grabs the input from the textbox
    //var startDate = new Date(d3.select("#startDateInput").node().value);
    var startDate = d3.select("#startDateInput").node().value.split("-");
    var endDate = d3.select("#endDateInput").node().value.split("-");
    var city = d3.select("#cityInput").node().value.trim().toLowerCase();
    var state = d3.select("#stateInput").node().value.trim().toLowerCase();
    var country = d3.select("#countryInput").node().value.trim().toLowerCase();
    var shape = d3.select("#shapeSelect").node().value.trim().toLowerCase();
    
    // Set filteredData to an array of all dataSet matching the filter
    filteredData = dataSet.filter(function(ufoSighting) {
        var ufoDate = new Date(ufoSighting.datetime);
        var ufoCity = ufoSighting.city.trim().toLowerCase();
        var ufoState = ufoSighting.state.trim().toLowerCase();
        var ufoCountry = ufoSighting.country.trim().toLowerCase();
        var ufoShape = ufoSighting.shape.trim().toLowerCase();

        // Initialise the return value to true so the row will be shown
        var isMatch = true;

        if ((startDate != "") && (endDate != "")) {
            sDate = new Date(startDate);
            eDate = new Date(endDate);
            isMatch = isMatch && (ufoDate >= sDate) && (ufoDate <= eDate);
        } else if ((startDate != "") && (endDate == "")) {
            sDate = new Date(startDate);
            isMatch = isMatch && (ufoDate >= sDate);
        } else if ((startDate == "") && (endDate != "")) {
            eDate = new Date(endDate);
            isMatch = isMatch && (ufoDate <= eDate);
        }

        if (city != "") {
            isMatch = isMatch && (ufoCity === city);
        }

        if (state != "") {
            isMatch = isMatch && (ufoState === state);
        }

        if (country != "") {
            isMatch = isMatch && (ufoCountry === country);
        }

        if (shape != "") {
            if (shape === "all") {
                isMatch = isMatch && true;
            } else {
                isMatch = isMatch && (ufoShape === shape);
            }
        }
        console.log(ufoCity);
        console.log(isMatch);

        return isMatch;
      });

  renderDataTable(1);
};

/**
 * This function sets the callback functions for all the clickable pagination elements
 */
function setCallbacks() {
    // The click handler for the pagination links
    d3.select(".pagination").selectAll("li").on("click", function handleClickPag() {

        // Grab name from page clicked
        var page = d3.select(this).attr("data_page");
        var li_class = d3.select(this).attr("class");

        console.log("Reached Pagination Click click click : " + page);
        console.log("LI class =  " + li_class);

        // handle the click based on whether "prev" or "next" or a specific number is clicked
        if (page == "prev") {
            // handle prev click
            if (li_class == "disabled") {
                // do not do anythng
                console.log("Ignoring disabled prev page click")
            } else {
                // handle click here
                // get the active li to get the current page number
                curr_page = d3.select(".pagination").select(".active").attr("data_page");
                renderDataTable(parseInt(curr_page)-1);
            }
        } else if (page == "next") {
            // handle next click
            if (li_class == "disabled") {
                // do not do anythng
                console.log("Ignoring disabled next page click")
            } else {
                // handle click here
                // get the active li to get the current page number
                curr_page = d3.select(".pagination").select(".active").attr("data_page");
                renderDataTable(parseInt(curr_page)+1);
            }
        } else {
            // handle a specific page number click
            if (li_class == "active") {
                // do not do anythng as it is already active
                console.log("Ignoring already active  page click")
            } else {
                // handle click here
                renderDataTable(parseInt(page));
            }

        }

    });
}

// On initial load of the page render the filter section and data table
renderFilters();
renderDataTable(1);

