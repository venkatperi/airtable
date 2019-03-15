import { AirTable } from "../airtable"
import { airtableConfig } from "../config"

exports.command = "login"
exports.builder = {}
exports.handler = () => {
    const products = new AirTable({
        apiKey: airtableConfig.apiKey || '',
        base: airtableConfig.base || '',
        table: 'Products'
    })
    products.list()
            .then(console.log)
            .catch(console.log)
}
