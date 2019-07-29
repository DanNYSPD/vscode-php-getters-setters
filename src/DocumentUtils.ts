import * as vscode from 'vscode';


export default class DocumentUtils{

    /**
     * Returns the number line where the needle was found.
     * @param needle 
     * @param beggining 
     * @param document 
     */
    static searchFirts(needle:string,beggining:number,document: vscode.TextDocument ){
        let founded:boolean=false;
        
        while (founded==false) {
            if(beggining>document.lineCount){
                return -1;
            }

            if(document.lineAt(beggining).text.indexOf(needle)>0){
                return beggining;
            }
            beggining++;
        }
    }
}