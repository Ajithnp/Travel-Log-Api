
const timeGenerator = (minutes: number) : Date =>{
    return new Date(Date.now() + minutes* 60* 1000);
}


// use- timeGenerator(5)