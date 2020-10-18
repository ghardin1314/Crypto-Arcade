import React from 'react'
import { makeStyles } from "@material-ui/core/styles";
import CustomTopbar from "../components/Topbar.js";


const useStyles = makeStyles((theme) => ({
    root: {
      display: "flex",
      flexFlow: "column",
    },
  }));

export default function CustomLayout(props) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <CustomTopbar />
            
            {props.children}
            
        </div>
    )
}
