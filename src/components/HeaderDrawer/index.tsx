import { useState } from "react";
import { Paper } from "@mui/material";
import { Global } from "@emotion/react";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";

import Header from "../Header";
import Description from "../Description";

export default function HeaderDrawer() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <>
      <Paper
        elevation={4}
        sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9 }}
      >
        <Header openDrawer={toggleDrawer(true)} />
      </Paper>
      <Global
        styles={{
          ".MuiDrawer-root > .MuiPaper-root": {
            maxHeight: "50%",
            overflow: "scroll",
          },
        }}
      />
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        swipeAreaWidth={0}
        disableSwipeToOpen={true}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {/* The following div is added to maintain the height
        of the header when the drawer is in opened state but I
        don't understand why do I need to add a div here */}
        <div>
          <Header openDrawer={toggleDrawer(true)} />
        </div>
        <Description />
      </SwipeableDrawer>
    </>
  );
}
