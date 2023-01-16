import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Analytics from "../components/Analytics";
import Earnings from "../components/Earnings";
import FAQ from "../components/FAQ";
import Profile from "../components/Profile";
import Transfers from "../components/Transfers";
import scrollreveal from "scrollreveal";
export default function DashboardPage() {
  const [totalOrdersFromThisYear, setTotalOrdersFromThisYear] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      const totalOrdersFromThisYearResponse = await fetch(
        "https://us-central1-jumsite-a9a31.cloudfunctions.net/countOrdersForCurrentYear"
      );
      setTotalOrdersFromThisYear(await totalOrdersFromThisYearResponse.json());
    };
    fetchData();
    const sr = scrollreveal({
      origin: "bottom",
      distance: "80px",
      duration: 2000,
      reset: false,
    });
    sr.reveal(
      `
        nav,
        .row__one,
        .row__two
    `,
      {
        opacity: 0,
        interval: 100,
      }
    );
  }, []);
  return (
    <Section>
      {/* <Navbar /> */}
      <div className="grid">
        <div className="row__one">
          <Analytics totalOrdersFromThisYear={totalOrdersFromThisYear} />
          <FAQ />
        </div>
        <div className="row__two">
          <Earnings />
          <Transfers />
          <Profile totalOrdersFromThisYear={totalOrdersFromThisYear} />
        </div>
      </div>
    </Section>
  );
}

const Section = styled.section`
  margin-left: 18vw;
  padding: 2rem;
  height: 100%;
  .grid {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 1rem;
    .row__one {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      height: 50%;
      gap: 1rem;
    }
    .row__two {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      height: 50%;
    }
  }
  @media screen and (min-width: 280px) and (max-width: 1080px) {
    padding: 1rem;
    margin-left: 0;
    .grid {
      .row__one,
      .row__two {
        grid-template-columns: 1fr;
      }
    }
  }
`;
