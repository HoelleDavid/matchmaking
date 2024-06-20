//zips multiple arrays to the shortest array length
const zip = (...arrays) => {
    const length = Math.min(...arrays.map(arr => arr.length))
    const acc = []
  
    for (let i = 0; i < length; i++) 
      acc.push(arrays.map(arr => arr[i]))
  
    return acc;
}

//returns randomize array element order
const shuffle_array = (array) => array.map(
    value => ({ value, sort: Math.random() }) 
).sort(
    (a,b) => a.sort - b.sort
).map(
    ({ value }) => value
)

//returns all numbers from incl. index_start to incl. index_end as array
const array_range = (index_start,index_end) => {
    const array = [];
    for (let i = index_start; i <= index_end; i++)
        array.push(i)
    return array;
}

//calculates unique pairs of a list
const unique_pairs = (array) => {
    const pairs = []
    for (let i = 0; i < array.length; i++) {
        for (let j = i + 1; j < array.length; j++)
            pairs.push([array[i], array[j]])
    }
    return pairs
}


//collapse n dimensional indiex to single dim index using dimension lengths
const from_index = (index,dim_lengths) => {
    const indices = []
    let tmp = index
    for (let i = 0; i < dim_lengths.length; i++) {
        indices[i] = tmp % dim_lengths[i]
        tmp = Math.floor(tmp / dim_lengths[i])
    }
    return indices;
}
//expand 1 dimensional int array indiex to n dimensional using dimension lengths
const to_index = (indices,dim_lengths) => {
    let index = 0  
    for (let i = 0; i < indices.length; i++) {
        let tmp = 1;
        for (let j = i + 1; j < dim_lengths.length; j++)
            tmp *= dim_lengths[j]
        index += indices[i] * tmp
    }
  return index;
}
module.exports = {zip,array_range,shuffle_array,unique_pairs,from_index,to_index}