import React from 'react'
import ProductCard from './ProductCard'
import { useAppContext } from '../context/AppContext'

const BestSeller = () => {
    const { products } = useAppContext();
    return (
        <div className='mt-12 sm:mt-16 px-4 sm:px-0'>
            <p className='text-xl sm:text-2xl md:text-3xl font-medium'>Best Sellers</p>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6 xl:gap-8 mt-4 sm:mt-6'>
                {products.filter((product) => product.inStock).slice(0, 5).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BestSeller;
