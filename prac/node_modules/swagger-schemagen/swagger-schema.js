const fs = require('fs')
var path = require('path');

module.exports = async (outputFile, schemaFolder) => {
    if (!outputFile)
        throw console.error("\nError: 'outputFile' was not specified.")
    if (!schemaFolder)
        throw console.error("\nError: 'schemaFolder' was not specified.")

    if (!fs.existsSync(outputFile)) {
        throw console.error("\nError: File not found: '" + outputFile + "'")
    }

    if (!fs.existsSync(schemaFolder)) {
        throw console.error("\nError: Folder not found: '" + schemaFolder + "'")
    }

    fs.readdir(schemaFolder, async (err, files) => {
        let output = require(path.resolve(outputFile));
        Object.keys(output.paths).map(pathkeys => {
            Object.keys(output.paths[pathkeys]).map(methodkeys => {  // get post put delete...
                if (output.paths[pathkeys][methodkeys].tags && output.paths[pathkeys][methodkeys].tags.length > 0 && output.paths[pathkeys][methodkeys].parameters) {
                    if (files.filter(f => f.split('.')[0] == output.paths[pathkeys][methodkeys].tags[0]).length > 0) {
                        let filename = files.filter(f => f.split('.')[0] == output.paths[pathkeys][methodkeys].tags[0])[0]
                        let schema = require(path.resolve(schemaFolder + '\\' + filename))
                        if (output.paths[pathkeys][methodkeys].parameters) {
                            output.paths[pathkeys][methodkeys].parameters.map(value => {
                                if (schema.filter(s => s.attr == value.name)[0]) {
                                    let type = schema.filter(s => s.attr == value.name)[0].type
                                    if (type == 'Int' || type == 'SmallInt' || type == 'BigInt') {
                                        type = 'integer'
                                    }
                                    else if (type == 'Float') {
                                        type = 'number'
                                    }
                                    else if (type == 'NVarChar' || type == 'VarChar') {
                                        type = 'string'
                                    }
                                    else if (type == 'Bit') {
                                        type = 'boolean'
                                    }
                                    else {
                                        type = type.toLowerCase()
                                    }
                                    value.type = type
                                }
                                if (value.schema) {
                                    if (value.schema.properties) {
                                        Object.keys(value.schema.properties).map(objvalue => {
                                            if (schema.filter(s => s.attr == objvalue).length > 0) {
                                                let objtype = schema.filter(s => s.attr == objvalue)[0].type
                                                if (objtype == 'Int' || objtype == 'SmallInt' || objtype == 'BigInt') {
                                                    objtype = 'integer'
                                                }
                                                else if (objtype == 'Float') {
                                                    objtype = 'number'
                                                }
                                                else if (objtype == 'NVarChar' || objtype == 'VarChar') {
                                                    objtype = 'string'
                                                }
                                                else if (objtype == 'Bit') {
                                                    objtype = 'boolean'
                                                }
                                                else {
                                                    objtype = objtype.toLowerCase()
                                                }
                                                value.schema.properties[objvalue].type = objtype;
                                                delete value.schema.properties[objvalue]['example']
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                }
            })
        })
        let dataJSON = JSON.stringify(output, null, 2)
        await fs.writeFileSync(outputFile, dataJSON)
        console.log('Swagger-schema: Success')
    })
}