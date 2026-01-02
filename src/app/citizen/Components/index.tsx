"use client";
import React from 'react'
import Hero from './Hero'
import Features from './Features'
import FAQ from './FAQ'
import VideoSection from './VideoSection'

type Props = {}

const Home = (props: Props) => {
  return (
    <>
      <Hero />
    {/*  <VideoSection /> */}
      <Features />
      <FAQ />
    </>
  )
}

export default Home