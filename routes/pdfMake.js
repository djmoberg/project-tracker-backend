var express = require('express');
var router = express.Router();

var PdfPrinter = require('pdfmake/src/printer');

function isCurrentlySelected(overview, selectedMonth, selectedYear) {
    return ((selectedMonth === (new Date(overview.workDate).getMonth()).toString()
        || selectedMonth === "Alle")
        && (selectedYear === (new Date(overview.workDate).getFullYear())
            || selectedYear === "Alle"))
}

function filterOverview(overview) {
    return overview.filter(overview => {
        return isCurrentlySelected(overview)
    })
}

function overviewTable(overview, wage) {
    let body = [['Dato', 'Tid', 'Timer', 'Kommentar', 'Sum']]
        .concat(filterOverview(overview).map(row =>
            [
                row.workDate,
                row.workFrom + "-" + row.workTo,
                calculateHours(row.workFrom, row.workTo),
                row.comment,
                { text: calculateHours(row.workFrom, row.workTo) * wage + " kr", alignment: "right" }
            ]
        )).concat([[
            { text: "Sum", border: [false, true, false, false], bold: true },
            "",
            "",
            "",
            { text: getTotalHours(filterOverview(overview)) * wage + ' kr', alignment: "right", bold: true }
        ]])

    let table = {
        headerRows: 1,
        widths: ['auto', 'auto', 'auto', '*', 'auto'],
        body
    }

    return table
}

function calculateHours(from, to) {
    var fromS = from.split(":")
    var fromH = parseFloat(fromS[0])
    var fromM = parseFloat(fromS[1])
    fromM = (fromM * 60) / 3600

    var toS = to.split(":")
    var toH = parseFloat(toS[0])
    var toM = parseFloat(toS[1])
    toM = (toM * 60) / 3600

    return (toH + toM) - (fromH + fromM)
}

function getTotalHours(overview) {
    let totalHours = 0

    for (let i = 0; i < overview.length; i++) {
        totalHours += calculateHours(overview[i].workFrom, overview[i].workTo)
    }

    return totalHours
}

router.get('/', (req, res, next) => {
    // let printer = new PdfPrinter()
    // let overview = req.body.overview
    // let selectedMonth = req.body.selectedMonth
    // let selectedYear = req.body.selectedYear
    // let wage = req.body.wage

    let dd = {
        content: [
            { text: 'Faktura for perioden ', fontSize: 30 },
            // { text: 'Antall Timer: ' + getTotalHours(filterOverview(overview, selectedMonth, selectedYear)), fontSize: 20 },
            // { text: 'Beløp: ' + getTotalHours(filterOverview(overview, selectedMonth, selectedYear)) * wage + ' kr', fontSize: 20 },
            // {},
            // { text: 'Grunnlag', fontSize: 25, alignment: 'center' },
            // {
            //     layout: 'lightHorizontalLines', // optional
            //     table: overviewTable(overview, wage)
            // }
        ]
    }

    var fs = require('fs');

    var fonts = {
        Roboto: {
            normal: 'fonts/Roboto-Regular.ttf',
            bold: 'fonts/Roboto-Medium.ttf',
            italics: 'fonts/Roboto-Italic.ttf',
            bolditalics: 'fonts/Roboto-MediumItalic.ttf'
        }
    };

    var PdfPrinter = require('pdfmake/src/printer');
    var printer = new PdfPrinter(fonts);

    var pdfDoc = printer.createPdfKitDocument(dd);

    var chunks = []
    var result

    pdfDoc.on('data', function (chunk) { chunks.push(chunk) });
    pdfDoc.on('end', function () {
        result = Buffer.concat(chunks)
        res.contentType('application/pdf')
        res.send(result)
    });
    pdfDoc.end()



    //res.send('Hello World 5')



    // // Make sure the browser knows this is a PDF.
    // res.set('content-type', 'application/pdf')

    // // Create the PDF and pipe it to the response object.
    // let pdfDoc = printer.createPdfKitDocument(dd)
    // pdfDoc.pipe(res)
    // pdfDoc.end()
})

module.exports = router;