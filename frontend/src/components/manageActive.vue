<template>
    <div>
        <headerBar></headerBar>
        <v-container class="mt-5">
            <h1>{{circleName}} Active</h1>

            <v-flex xs9>
                <md-field>
                        <label>Title</label>
                        <md-input v-model="title" type="text"></md-input>
                </md-field>
            </v-flex>

            <div v-if="!image">
                <h2>Select an image</h2><br/>
                <input type="file" @change="onFileChange">
            </div>
            <div v-else>
                <v-img :src="image" aspect-ratio="5" contain/>
                <v-btn @click="removeImage">Remove image</v-btn>
            </div>


            <v-layout row wrap class ='mt-5'>
                <v-flex xs12 sm6>
                <v-date-picker
                    color="green"
                    :events="allowDate"
                    v-model="dates"
                    multiple
                ></v-date-picker>
                </v-flex>
            <v-flex xs12 sm6>
                    <v-combobox
                    slot="activator"
                    v-model="date1"
                    small-chips
                    label="시작 일정"
                    prepend-icon="event"
                    readonly
                    ></v-combobox>

                    <v-combobox
                    slot="activator"
                    v-model="date2"
                    small-chips
                    label="마감 일정"
                    prepend-icon="event"
                    readonly
                    ></v-combobox>

                   <v-textarea
                    outline
                    name="contents"
                    label="활동 내용"
                    v-model="contents"
                    ></v-textarea>
                <v-btn color="blue" @click="onSubmit()">활동 추가</v-btn>
                <v-btn color="blue" @click="onBack()">취소</v-btn>
                </v-flex>
            </v-layout>
            <v-data-table
                v-model="selected"
                :headers="headers"
                :items="users"
                item-key="_id"
                select-all
                prev-icon="chevron_left"
                next-icon="chevron_right"
                :rows-per-page-items="[5]"
                class="elevation-1"
            >
            <template slot="items" slot-scope="props">
                <td :active="props.selected" @click="props.selected = !props.selected">
                    <v-checkbox
                     :input-value="props.item.value"
                     primary
                     color="blue"
                     off-icon="clear"
                     on-icon="lens"
                     hide-details
                    ></v-checkbox>
                </td>
                <td>{{props.item.name}}</td>
                <td class="text-xs-right">{{props.item.studentId}}</td>

            </template>
            </v-data-table>
        </v-container>
    </div>
</template>
<script>
import headerBar from './header.vue'
export default{
    data(){
        return{
            selected: [],
            headers: [
            {
                text: '동아리 멤버',
                align: 'left',
                sortable: false
            },
            {
                text: '학번',
                value: 'studentId',
                align: 'right'
            }
            ],
            bol: 0,
            num: 0,
            title : "",
            circleName: this.$route.params.circleName,
            date1 : Date,
            date2 : Date,
            dates: [new Date().toISOString().substr(0, 10)],
            contents: "",
            activeId: this.$route.params.activeId,
            image: "",
            userName : this.$session.getAll().username,
            files: [],
            circle: {},
            members: [],
            users: [],
            pastMembers: []
        }
    },
    created : async function(){
	if(this.activeId!=undefined){
        this.$http.get("http://adong.cf:8000/circle/"+this.circleName+"/active/"+this.activeId).then((data)=>{
            let info=data.data
            this.pastMembers=data.data.members
            this.title=info.title
            this.date1=info.start.substr(0,10)
            this.date2=info.end.substr(0,10)
            this.image=info.image
            this.contents=info.contents
            if(this.userName==data.data.author) this.match=true;
        })}
        await this.$http.get("http://adong.cf:8000/circle/find/" + this.circleName).then((res) => {
            for(let i = 0; i < res.data.members.length; i++){
                if(res.data.members[i].circleAuth == true) // 동아리 등록된 회원들만 come in
                    this.members.push(res.data.members[i])
            }
            for(let i = 0; i < this.members.length; i++){
                this.users.push(this.members[i].user)
            }
        }).then(() =>{
            for(let i = 0; i < this.users.length; i++){
                for(let j = 0; j < this.pastMembers.length; j++){
                    if(this.pastMembers[j].studentId == this.users[i].studentId){
                        this.users[i].value = true
                        this.selected.push(this.users[i])
                    }
                }
            }
        })
        
    },
    methods:{
        // 데이트 설정 갯수 제안
            allowDate:function(){
                let dates=this.dates
                if(dates.length==0){
                    this.date1=null
                    this.date2=null
                }else if(dates.length==1){
                    this.date1=dates[0]
                    this.date2=dates[0]
                }else if(this.dates.length==2){
                    if(dates[0]<dates[1]){
                        this.date1=dates[0]
                        this.date2=dates[1]
                    }else{
                        this.date1=dates[1]
                        this.date2=dates[0]
                    }
                }
                if(this.dates.length>2){
                    this.dates.splice(2,1)
                }
            },
            onSubmit: function(){
                
                if(this.activeId == undefined){
                    for(var i = 0; i < this.selected.length; i++){
                        this.selected[i].value = true                        
                    }
                    // 새로 만드는 거 if(this.activeId != this.$route.params.activeId)
                    this.$http.post("http://adong.cf:8000/circle/"+this.circleName+"/active/create",
                    {"title":this.title,"contents":this.contents,"circleName":this.circleName,"start":this.date1,"end":this.date2
                    ,"image":this.image, "members":this.selected})
                    .then((data)=>{
                        
                        this.$router.push("/circle/"+this.circleName);
                    })
                }
                else{ // 수정
                    this.$http.post("http://adong.cf:8000/circle/"+this.circleName+"/active/update/"+this.activeId,
                    {"title":this.title,"contents":this.contents,"circleName":this.circleName,"start":this.date1,"end":this.date2
                    ,"image":this.image, "activeId":this.activeId, "members":this.selected})
                    .then((data)=>{
                        
                        this.$router.push("/circle/"+this.circleName);
                    })
                }
            },
            onBack: function(){
                history.back()
            },
            onFileChange(e) {
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length)
                    return;
                console.log(files[0])
                this.files.push(files[0])
                this.createImage(files[0]);
            },
            createImage(file) {
                var image = new Image();
                var reader = new FileReader();

                reader.onload = (e) => {
                    this.image = e.target.result;
                };
                reader.readAsDataURL(file);
            },
            removeImage: function (e) {
            this.image = '';
            }
    },
    components: {
            headerBar
    },
}
</script>
