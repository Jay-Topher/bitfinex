import { Box, Button, IconButton, Typography } from "@mui/material";
// import ws from 'ws'
import { Stack } from "@mui/system";
import React, { useEffect, useState } from "react";
import { pxToRem } from "../utils";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import { useDispatch, useSelector } from "react-redux";
import {
  clearErrors,
  updateOrders,
  updateOrdersFailed,
} from "../store/slices/orderSlice";

function OrderBook() {
  const leftTableHead = ["COUNT", "AMOUNT", "TOTAL", "PRICE"];
  const dispatch = useDispatch();
  const { books, errors } = useSelector((state) => state.orders);
  const [precision, setPrecision] = useState(0);
  let wss;

  wss = new WebSocket("wss://api-pub.bitfinex.com/ws/2");
  const msg = JSON.stringify({
    event: "subscribe",
    channel: "book",
    symbol: "tBTCUSD",
    prec: `P${precision}`,
  });

  wss.onopen = (evt) => {
    wss.send(msg);
  };

  wss.onmessage = (evt) => {
    if (evt.data) {
      const order = JSON.parse(evt.data);
      if (Array.isArray(order)) {
        dispatch(updateOrders(order[1]));
      }
    }
  };

  const changePrecision = () => {
    if (wss) {
      wss.close();
    }
    wss = new WebSocket("wss://api-pub.bitfinex.com/ws/2");
    const msg = JSON.stringify({
      event: "subscribe",
      channel: "book",
      symbol: "tBTCUSD",
      prec: `P${precision}`,
    });

    wss.onopen = (evt) => {
      wss.send(msg);
    };

    wss.onmessage = (evt) => {
      if (evt.data) {
        const order = JSON.parse(evt.data);
        if (Array.isArray(order)) {
          dispatch(updateOrders(order[1]));
          if (errors) {
            dispatch(clearErrors());
          }
        }
      }
    };
  };

  wss.onclose = () => {
    console.log("Web socket closed");
  };

  wss.onerror = (evt) => {
    dispatch(updateOrdersFailed("An Error Occured"));
  };

  const handleSocketClose = () => {
    wss.close(1000, "Connection closed by user.");
  };

  const increasePrecision = () => {
    setPrecision((prev) => (prev === 4 ? prev : prev + 1));
  };

  const decreasePrecision = () => {
    setPrecision((prev) => (prev === 0 ? prev : prev - 1));
  };

  useEffect(() => {
    changePrecision();

    return () => {
      wss.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precision, msg]);

  return (
    <Box sx={{ width: pxToRem(873) }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ width: "100%" }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography>Order Book</Typography>
            <Typography>BTC/USD</Typography>
          </Box>
          <Box>
            <IconButton
              onClick={decreasePrecision}
              aria-label="Decrease precision"
              title="Decrease precision"
              disabled={precision <= 0}
            >
              <ArrowCircleLeftIcon />
            </IconButton>
            <IconButton
              onClick={increasePrecision}
              aria-label="Increase precision"
              title="Increase precision"
              disabled={precision >= 4}
            >
              <ArrowCircleRightIcon />
            </IconButton>
          </Box>
        </Stack>
      </Box>
      <Box sx={{ display: "flex" }}>
        <Box className="table-left" sx={{ flex: 1 }}>
          <Box component="table" sx={{ width: "100%" }}>
            <thead>
              <tr>
                {leftTableHead.map((th) => (
                  <th key={th} className="table-head-item">
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <Box component="tbody" sx={{ width: "100%", textAlign: "center" }}>
              {books &&
                books.slice(0, 10).map((book, idx) => {
                  return (
                    <tr key={idx}>
                      <td>{book.count}</td>
                      <td>{book.amount}</td>
                      <td></td>
                      <td>{book.price}</td>
                    </tr>
                  );
                })}
            </Box>
          </Box>
        </Box>
      </Box>
      <Stack>
        <Button onClick={handleSocketClose}>Disconnect</Button>
      </Stack>

      {errors && <Typography>{errors}</Typography>}
    </Box>
  );
}

export default OrderBook;
