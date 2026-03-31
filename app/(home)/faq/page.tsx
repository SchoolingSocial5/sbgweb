'use client'
import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/Public/PageBanner'
import FaqStore, { Faq } from '@/src/zustand/faq'
import { motion, AnimatePresence } from 'framer-motion'

function Faqs() {
  const { faqs } = FaqStore()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [newFaqs, setNewFaqs] = useState<Faq[]>([])
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    setNewFaqs(faqs.filter((item) => item.category === activeCategory))
    setOpenIndex(null)
  }, [activeCategory, faqs])

  useEffect(() => {
    if (faqs.length > 0 && !activeCategory) {
      setActiveCategory(faqs[0].category)
    }
  }, [faqs, activeCategory])

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div>
      <PageHeader page="FAQ" title="Frequently Asked Questions" />

      {/* Header Section */}
      <div className="flex justify-center pb-1 pt-[70px]">
        <div className="customContainer">
          <div className="flex flex-col max-w-[750px]">
            <div className="text-[30px] text-[var(--primaryTextColor)] mb-2 font-bold">
              Paragon Farms Ltd: Frequently Asked Questions
            </div>
            <div className="text-[16px] text-[var(--secondaryTextColor)]">
              Welcome to the Paragon Farms Ltd FAQ. Since our launch in 2025, we
              have been committed to providing premium poultry products and sustainable
              farming solutions across Nigeria.
            </div>
          </div>
        </div>
      </div>

      <div className="flex py-[100px] justify-center bg-[var(--backgroundColor)]">
        <div className="customContainer">
          <div className="grid items-start md:grid-cols-3 md:gap-7 gap-4 w-full">

            <div className="flex flex-col md:col-span-1 shadow-lg py-5 sm:py-[45px] px-[35px] w-full mb-7 bg-white rounded-lg">
              <div className="text-[25px] text-[var(--primaryTextColor)] font-bold mb-5">
                Quick Navigation
              </div>
              {[...new Set(faqs.map((item) => item.category))].map((category, index) => (
                <div
                  onClick={() => setActiveCategory(category)}
                  key={index}
                  className={`${activeCategory === category ? 'text-[var(--customRedColor)] font-bold' : 'text-[var(--secondaryTextColor)]'
                    } hover:text-[var(--customRedColor)] underline mb-3 cursor-pointer transition-colors`}
                >
                  {category}
                </div>
              ))}
            </div>

            <div className="flex flex-col md:col-span-2 w-full">
              <div className="text-[var(--customColor)] text-[27px] underline mb-5 font-bold">
                Customer Support
              </div>

              {newFaqs.map((item, i) => (
                <div key={i} className="flex flex-col shadow-sm mb-4 bg-white rounded-lg overflow-hidden">
                  <div
                    className="flex px-4 py-3 items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleFaq(i)}
                  >
                    <div className="text-[20px] text-[var(--primaryTextColor)] font-medium">
                      {item.question}
                    </div>
                    <motion.i
                      animate={{ rotate: openIndex === i ? 45 : 0 }}
                      className="bi bi-plus-lg text-[28px] text-[var(--primaryTextColor)] ml-auto"
                    ></motion.i>
                  </div>

                  <AnimatePresence>
                    {openIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div
                          className="px-4 text-[var(--secondaryTextColor)] border-t border-gray-100 py-3"
                          dangerouslySetInnerHTML={{ __html: item.answer }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Faqs
