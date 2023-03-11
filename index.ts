// We don't care about what is inside the product objects,
// but i think, that it is better to create type Product even now it has any type inside
type Product = {} 

type PriceRange = {minPrice: number, maxPrice: number}
type PriceRangesArray = Array<PriceRange> 

// This is how responseData object should look like
interface ResponseData {        // For example: 
    total: number,              // "total": 99999,
    count: number,              // "count": 1000,
    products: Array<Product>    // "products": [{}, {}, ...]
}

const url = 'https://api.ecommerce.com/products' // API endpoint 

// The first step is to deside in which price range request func will search products
function defineRanges(range: number): PriceRangesArray { 
    const priceRangesArray: PriceRangesArray = []
    const maximumCost = 100000 // Costs somewhere between $0 and $100,000 
    const allRanges = maximumCost / range  // Split Maximium on price range to get all ranges
    for(let i = 0; i < allRanges; i++) { 
        let minPrice = i * range 
        let maxPrice = (i + 1) * range 
        priceRangesArray.push({
            minPrice: minPrice,
            maxPrice: maxPrice
        })
    }
    return priceRangesArray
}

// The second step is to create request function wich return array of products from range 
async function sendRequest(minPrice: number, maxPrice: number): Promise<Array<Product>> {
  try {
    const response = await fetch(`${url}?price-range=${minPrice}-${maxPrice}`)
    const responseData: ResponseData = await response.json() // Parse json
    const products: Array<Product> = accumulateProducts(responseData)
    return products
  } catch (error) {
    throw error
  }
}

// Algorithm that ensure that all products are scraped and accumulate all products into a single array called products.
function accumulateProducts(data: ResponseData): Array<Product> {
  const products: Array<Product> = []
    data.products.forEach((product: Product) => products.push(product))
    if(products.length === data.count) {
        console.log('Products were saved successfully')
        return products
    } 
    console.log('Some products are missing')
    return products
}

// The third step is to extract all products
async function extractProducts(range: number): Promise<Array<Product>> {
    const allProducts: Array<Product> = []
    const priceRanges = defineRanges(range)
    try {
        const responseData: ResponseData = await fetch(url) // Make request to find out total amount products
            .then(response => response.json()) 
        const total = responseData.total  
    
        // Send requests to get all products from all ranges
        for(let i = 0; i < priceRanges.length; i++) {
            const result: Array<Product> = await sendRequest(priceRanges[i].minPrice, priceRanges[i].maxPrice) 
            allProducts.push(...result) // Prevent allProducts from being 2D array
        }
    
        if(allProducts.length === total) { //Make sure that all products were saved
            console.log('All products have been extracted')
            return allProducts
        } 
        console.log('Error, not all products have been extracted') 
        return allProducts
        
    } catch (error) {
        console.log(error)
        throw error
    }
}

extractProducts(1000) // Choose range (for example: 1000) and extract products





