export default class EndPoint{
    
    path:string;

    method:string;//get,post (httpMethod)

    name:string;//the methods name

    filePath:string;

    numberLine:number;

    controllerClassName:string;

    controllerClassMethod:string;

    controllerNamespace:string;//this will have the namespace, i can ge it from routes imports

}