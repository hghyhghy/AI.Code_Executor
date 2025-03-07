import { Injectable } from '@nestjs/common';

@Injectable()
export class CollaborationService {
    private rooms:{ [key : string]:string} = {}
    
    getCode(roomId:string):string{
        return this.rooms[roomId] || " "
    }

    updateCode(roomId:string,content:string){
        this.rooms[roomId] = content
    }
}
 