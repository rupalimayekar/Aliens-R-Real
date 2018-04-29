/********************************************************************************************/
/* Aliens-R-Real       
/* This file contains all the javascript code to display the data table, 
/* filter data and paginate through the results.
/********************************************************************************************/
  
var filteredData = dataSet; // We start with the complete dataset on initial load
const PAGESIZE = 1000;    // The max number of rows to display per page

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
    $filterPanel.append("br");
    
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
    var $shapeList = $filterPanel.append("div").attr("class", "form-group shape-filter");
    $shapeList.append("label").attr("for", "shapeSelect").text("Shape:");
    var shapeSelect = $shapeList.append("select").attr("class", "form-control").attr("id", "shapeSelect");
    
    // Add values into the list for selection
    shapeSelect.append("option").text("All");
    uniqueShapes.forEach(shape => shapeSelect.append("option").text(shape));
    $filterPanel.append("br");

    // Add the filter button
    $filterBtn = $filterPanel.append("buton").text("Filter");
    $filterBtn.attr("class", "btn btn-primary btn-lg");
    $filterBtn.attr("type", "submit");
    $filterBtn.attr("id", "filterButton");
    $filterBtn.on("click", filterData);

    $filterPanel.append("span").html("&nbsp;&nbsp;&nbsp;&nbsp;");

    // Add the reset button
    $resetBtn = $filterPanel.append("buton").text("Reset");
    $resetBtn.attr("class", "btn btn-primary btn-lg");
    $resetBtn.attr("type", "submit");
    $resetBtn.attr("id", "resetButton");
    $resetBtn.on("click", resetFilters);

    $filterPanel.append("br");
    $filterPanel.append("br");
};

/**
 * This function calculates the total number of pages that the data is broken into for pagination
 * It returns the number of pages and number of rows in an object.
 */
function getRowPageCounts() {
    var totalRowCount = filteredData.length;
    
    // calculate the number of pages we will need to display the data
    var totalPageCount = Math.trunc(totalRowCount/PAGESIZE);
    
    if (totalRowCount%PAGESIZE != 0) {
        totalPageCount ++;
    }

    console.log("Total number of data rows == " + totalRowCount);
    console.log("Total number of pages == " + totalPageCount);

    return {"rowCount": totalRowCount, "pageCount": totalPageCount};
}

/**
 * This function renders the UFO Sightings data table on initial load and every time the filter
 * button is clicked. The contents of the table are in the filteredData variable. The filteredData
 * is initially set to the complete dataSet array of the data.js file.
 */
function renderDataTable(activePage) {

    console.log("renderDataTable -> PAGE IS ======  " + activePage);

    var maxPageLinks = 10 // The max number of pagination links to display
    
    var counts = getRowPageCounts();
    totalRowCount = counts.rowCount;
    totalPageCount = counts.pageCount;

    // if there are less than 10 pages, then the maxPageLinks should be the totalPages
    // this means that we have only one set of pages. This can happen when we filter
    if (totalPageCount < maxPageLinks) { maxPageLinks = totalPageCount;}

    // calculate the pagination start and end links. Start with 1 to 10
    var currPagStart = 1;
    var currPagEnd = maxPageLinks;

    // if the current page is beyond the first 10 pages
    if (activePage > maxPageLinks) {
        if (maxPageLinks > 0) {
            if (activePage%maxPageLinks == 0) {
                currPagStart = (Math.trunc((activePage-1)/maxPageLinks) * maxPageLinks) + 1;
            } else {
                currPagStart = (Math.trunc(activePage/maxPageLinks) * maxPageLinks) + 1;
            }
            currPagEnd = currPagStart + maxPageLinks - 1;
        } else {
            currPagStart = currPagEnd = 0;
        }
        // If this is the last set of pages then set the end to last page
        if (currPagEnd > totalPageCount) {currPagEnd = totalPageCount;}
    }

    console.log("current Page Start = " + currPagStart);
    console.log("current Page End = " + currPagEnd);

    var dataColumns = ["Date/Time", "City", "State", "Country", "Shape", "Duration", "Comments"];

    // Clear the existing title, pagination links and table
    $dataContainer = d3.select("#data-container");
    $dataContainer.html("");

    // Add a header for the table
    $dataContainer.append("h3").text("UFO Sightings...");

    // if there are no rows to be displayed then show a msg
    if (totalRowCount == 0) {
        $dataContainer.append("div").text("We found no matching results.");
        $dataContainer.append("br");
    } else {

        // Add the pagination
        $nav = $dataContainer.append("nav").attr("aria-label", "Results Pages");
        $navUL = $nav.append("ul").attr("class", "pagination pagination-sm");
        
        // First <<
        $li = $navUL.append("li").attr("data_page", "first");
        
        // if we are rendering the first page then disable the prev pagination link
        if (activePage == 1) { $li.attr("class", "disabled"); }
        
        // cont First <<
        $li.append("a").attr("aria-label", "First").
            append("span").attr("aria-hidden", "true").html('<i class="fa fa-fast-backward" aria-hidden="true"></i>');
        
        // Prev <
        $li = $navUL.append("li").attr("data_page", "prev");
        
        // if we are rendering the first page then disable the prev pagination link
        if (activePage == 1) { $li.attr("class", "disabled"); }
        
        // cont Prev <
        $li.append("a").attr("aria-label", "Previous").
            append("span").attr("aria-hidden", "true").html('<i class="fa fa-caret-left" aria-hidden="true"></i>');
        
        // create an li for each page
        for (var p=currPagStart; p<=currPagEnd; p++) {
            $li = $navUL.append("li").attr("data_page", p.toString());
            
            // if this is the page that should be active, then highlight it
            if (p == activePage) {
                $li.attr("class", "active");
            }

            $li.append("a").text(p.toString());

        }

        // Next >
        $li= $navUL.append("li").attr("data_page","next");
        
        // if we are rendering the last page then disable the next pagination link
        if (activePage == totalPageCount) { $li.attr("class", "disabled"); }
        
        // cont Next >
        $li.append("a").attr("aria-label", "Next").
            append("span").attr("aria-hidden", "true").html('<i class="fa fa-caret-right" aria-hidden="true"></i>');

        // Last >>
        $li= $navUL.append("li").attr("data_page","last");

        // if we are rendering the last page then disable the next pagination link
        if (activePage == totalPageCount) { $li.attr("class", "disabled"); }

        // cont Last >>
        $li.append("a").attr("aria-label", "Last").
        append("span").attr("aria-hidden", "true").html('<i class="fa fa-fast-forward" aria-hidden="true"></i>');
            


        var startRow = PAGESIZE*activePage - PAGESIZE;
        var endRow = PAGESIZE*activePage;

        // to handle the case when the last page has rows fewer than the pagesize
        if (activePage == totalPageCount) {
            endRow = totalRowCount;
        }
        
        console.log("startRow = " + startRow + "  endRow == " + endRow);

        var displayRow = startRow + 1;

        // display which rows you are showing
        $dataContainer.append("div").text("Showing results " + displayRow + " to " + endRow + " of " + totalRowCount);
        $dataContainer.append("br");

        // Add a bootstrap table. Display only the rows in the specific page
        $dataTable = d3.select("#data-container").append("table").attr("id", "data-table"); 
        $dataTable.attr("class", "table table-bordered table-striped table-responsive");
        $tr = $dataTable.append("thead").append("tr");
        
        // Add table headers
        for(var i=0; i<7; i++) {
            $tr.append("th").text(dataColumns[i]);
        }

        $tbody = $dataTable.append("tbody");

        // Add data rows
        for(var rownum=startRow; rownum<endRow; rownum++){
            //console.log("rownum == " + rownum);

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
    }

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
 * This function is the event handler for the Reset button on the filter panel. It clears all the
 * filter fields.
 */
function resetFilters() {
    // stop the default submit behavior
    d3.event.preventDefault();

    // clear all input fields
    d3.select("#startDateInput").node().value = "";
    d3.select("#cityInput").node().value = "";
    d3.select("#endDateInput").node().value = "";
    d3.select("#stateInput").node().value = "";
    d3.select("#countryInput").node().value = "";
    d3.select("#shapeSelect").node().value = "";
}

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
        } else if (page == "first") {
            if (li_class == "disabled") {
                // do not do anythng
                console.log("Ignoring disabled next page click")
            } else {
                // handle click here to go to the first page           
                renderDataTable(1);
            }
        } else if (page == "last") {
            if (li_class == "disabled") {
                // do not do anythng
                console.log("Ignoring disabled next page click")
            } else {
                // handle click here to go to the last page           
                var counts = getRowPageCounts();
                totalPageCount = counts.pageCount;
                renderDataTable(totalPageCount);
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

