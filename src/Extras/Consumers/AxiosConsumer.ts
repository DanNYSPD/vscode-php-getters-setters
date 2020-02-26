import EndPoint from "../EndPoint";

//import EndPoint from "../Endpoint";

export default class AxiosConsumer{


    static getTemplate(endPoint:EndPoint){
        const n=`\n`;
        return  `function `+endPoint.name+`(){`+n+
			`\treturn axios.`+endPoint.method+`(`+endPoint.path+`,{}).`+n+
			`\tthen(response=>{`+n+
			`\t\tif(response.data.status=='success'){`+n+
			`\t\t`+`return response.data;`+n+
			`\t\t`+n+
			`\t\t}else{`+n+
			`\t\t`+n+
			`\t\t}`+n+
			`\t})`+n+
			`\t.catch(error=>{`+n+
			   `\t\t console.error(error);`+n+
           `\t})`+n+
           `}`+n
           ;
    }
}