import * as convict from 'convict'
// import * as dotenv from 'dotenv'
//
// dotenv.load()

export const config = convict({
    env: {
        format: String,
        default: 'development'
    },
    airtable: {
        apiKey: {
            format: 'String',
            default: undefined,
        },
        base: {
            format: 'String',
            default: undefined,
        },
    },
})

config.loadFile('./config.json')
// let provider = config.get('oauth2.provider')
// config.loadFile(`./config.${provider}.json`)

config.validate()

export const airtableConfig = config.get('airtable')

