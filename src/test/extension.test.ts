//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../extension';
import {Names} from '../Names'
// Defines a Mocha test suite to group tests of similar kind together
describe("Extension Tests", () => {

    // Defines a Mocha unit test
    it("Something 1", () => {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
    it("PascalTosnake_case",()=>{
        let s="PascalTosnake_case";
        console.log(Names.toSnakeCase(s))
        assert.equal("pascal_tosnake_case",Names.toSnakeCase(s))
    })
});

