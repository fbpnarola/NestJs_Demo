import path from "path";
import converter from "json-2-csv";
import fs from "fs";

export async function convertIntoCSV(jsonArray, filenm) {
    try {
        converter.json2csv(jsonArray, (err, csv) => {
            if (err) throw err.message
            const createFile = path.join(__dirname, "../public/csv", `${filenm}.csv`)
            fs.writeFileSync(createFile, csv)
        })
    } catch (error) {
        throw error.message
    }
}

export async function fileDownload(fileName) {
    let csvFilePath = path.join(__dirname, "../public/csv", fileName);
    return csvFilePath
}