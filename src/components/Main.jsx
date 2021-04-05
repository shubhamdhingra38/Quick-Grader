import React from "react";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import MenuIcon from "@material-ui/icons/Menu";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import HomeIcon from "@material-ui/icons/Home";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import CreateIcon from "@material-ui/icons/Create";
import GroupWorkIcon from "@material-ui/icons/GroupWork";
import FindInPageIcon from "@material-ui/icons/FindInPage";
import ListSubheader from "@material-ui/core/ListSubheader";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import VpnKeyIcon from "@material-ui/icons/VpnKey";
import InfoIcon from "@material-ui/icons/Info";
import { withRouter } from "react-router-dom";
import AddIcon from "@material-ui/icons/Add";
import NoteAddIcon from "@material-ui/icons/NoteAdd";
import axios from "axios";

const drawerWidth = 240;

const domain = "http://127.0.0.1:8000/";
const api = {
  userinfo_url: domain + "auth/user/",
};

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  logoPic: {
    width: 100,
    height: 50,
    margin: theme.spacing(2),
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    background: "black",
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    paddingTop: theme.spacing(3),
  },
  navIcon: {
    marginRight: theme.spacing(1),
  },
  mainContent: {
    padding: theme.spacing(4),
  },
}));

const topElements = [
  {
    name: "Home",
    icon: HomeIcon,
    displayAlways: true,
    loginRequired: false,
    url: "/home",
  },
  { name: "About", icon: InfoIcon, loginRequired: false, url: "/about" },
  {
    name: "Account",
    icon: AccountBoxIcon,
    loginRequired: true,
    url: "/account",
  },
];

const dashboardElements = {
  Faculty: [
    {
      name: "Create Test",
      icon: AddIcon,
      loginRequired: true,
      url: "/create-test",
    },
    {
      name: "Grade Manually",
      icon: CreateIcon,
      loginRequired: true,
      url: "/dashboard/created-tests",
    },
    {
      name: "Grade [Cluster]",
      icon: GroupWorkIcon,
      loginRequired: true,
      url: "",
    },
    { name: "Plagiarism", icon: FindInPageIcon, loginRequired: true, url: "" },
  ],

  Student: [
    {
      name: "Take Test",
      icon: NoteAddIcon,
      loginRequired: true,
      url: "/take-test",
    },
  ],
};

const bottomElements = [
  { name: "Sign In", icon: VpnKeyIcon, loginRequired: false, url: "/login" },
  {
    name: "Register",
    icon: AccountBoxIcon,
    loginRequired: false,
    url: "/register",
  },
  {
    name: "Sign Out",
    icon: ExitToAppIcon,
    loginRequired: true,
    url: "/logout",
  },
];

function ListOfItems({ items, subheader, isLoggedIn, history }) {
  const classes = useStyles();
  let renderDivider = false;
  for (let i = 0; i < items.length; ++i) {
    let element = items[i];
    if (
      element.displayAlways ||
      (isLoggedIn && element.loginRequired) ||
      (!isLoggedIn && !element.loginRequired)
    ) {
      renderDivider = true;
      break;
    }
  }
  return (
    <>
      <List
        subheader={
          <ListSubheader component="div" id={`${subheader}-list-subheader`}>
            {subheader}
          </ListSubheader>
        }
      >
        {items.map((element, index) =>
          element.displayAlways ||
          (isLoggedIn && element.loginRequired) ||
          (!isLoggedIn && !element.loginRequired) ? (
            <ListItem
              button
              key={element.name}
              onClick={() => {
                history.push(element.url);
              }}
            >
              {<element.icon className={classes.navIcon} />}
              <ListItemText primary={element.name} />
            </ListItem>
          ) : null
        )}
      </List>
      {renderDivider && <Divider />}
    </>
  );
}

function Main(props) {
  const { window, history } = props;

  const classes = useStyles();
  const theme = useTheme();
  const [userInfo, setUserInfo] = React.useState();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isLoggedIn = props.token ? true : false;

  React.useEffect(() => {
    if (props.token) {
      console.log("sending request");
      axios
        .get(api.userinfo_url, {
          headers: {
            Authorization: `Token ${props.token}`,
          },
        })
        .then((res) => {
          setUserInfo(res.data);
        });
    }
  }, [props.token]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <div className={classes.toolbar}>
        <img
          className={classes.logoPic}
          src={require("./static/images/logo.png")}
        />
      </div>

      <Divider />
      <ListOfItems
        items={topElements}
        isLoggedIn={isLoggedIn}
        history={history}
      />

      {userInfo && (
        <ListOfItems
          items={dashboardElements[userInfo.group]}
          isLoggedIn={isLoggedIn}
          history={history}
        />
      )}

      <ListOfItems
        items={bottomElements}
        isLoggedIn={isLoggedIn}
        history={history}
      />
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            quickGrader
          </Typography>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer}>
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
    </div>
  );
}

export default withRouter(Main);
