import React, { useContext } from 'react';
import { connect, useDispatch } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';

import AddIcon from '@material-ui/icons/Add';
import { Alert, AlertTitle } from '@material-ui/lab';
// import AutoSuggest from '../../../components/AutoSuggest';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import Divider from '@material-ui/core/Divider';
import EditIcon from '@material-ui/icons/Edit';
// import Fab from '@material-ui/core/Fab';
import { green, red } from '@material-ui/core/colors';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import Switch from '@material-ui/core/Switch';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { WebSocketContext } from '../websockets/WebSocket';
import { useConfirm } from 'material-ui-confirm';
import TextField from '@material-ui/core/TextField';
import FileCopy from '@material-ui/icons/FileCopy';

import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';
import DisabledIcon from '@material-ui/icons/Cancel';
import EnabledIcon from '@material-ui/icons/CheckCircle';

import { updateApplicationTokens } from '../actions/actions';



const StyledTableRow = withStyles((theme) => ({
	root: {
		'&:nth-of-type(odd)': {
			backgroundColor: theme.palette.tables?.odd
		}
	}
}))(TableRow);

const useStyles = makeStyles((theme) => ({
	tableContainer: {
		minHeight: '500px',
		'& td:nth-child(2)': {
			minWidth: '100px'
		}
	},
	badges: {
		'& > *': {
			margin: theme.spacing(0.3)
		}
	},
	// fab: {
	// 	position: 'absolute',
	// 	bottom: theme.spacing(2),
	// 	right: theme.spacing(2)
	// },
	breadcrumbItem: theme.palette.breadcrumbItem,
	breadcrumbLink: theme.palette.breadcrumbLink,
    copyField: {
        maxWidth: '150px'
    },
    iconButton: {
        backgroundColor: 'transparent',
    },
	textField: {
		// paddingRight: theme.spacing(1),
		// marginRight: theme.spacing(1),
		// width: 250,
		margin: theme.spacing(1),
		paddingRight: 0
	},
	margin: {
		margin: theme.spacing(2),
	},
	paddingRight: {
		paddingRight: theme.spacing(3),
	},
	textfieldDisabled: {
		"& input.Mui-disabled": {
		  color: theme.palette.text.primary
		}
	}
}));

const USER_TABLE_COLUMNS = [
	{ id: 'name', key: 'Name' },
	{ id: 'role', key: 'Role' },
	{ id: 'requestedBy', key: 'Requested By' },
	{ id: 'issueDate', key: 'Issue Date' },
	{ id: 'validUntil', key: 'Valid Until' },
	{ id: 'lastUsed', key: 'Last Used' },
	{ id: 'hash', key: 'Hash' },
	{ id: 'status', key: 'Status'},
];


const stringToDate = (dateString) => { // ISO 8601 format date string
	return new Date(new Date(dateString).getTime() + (new Date().getTimezoneOffset() * 60 * 1000)); 
};


const formatDateToISO8601String = (date) => {
	return getDateString(date, ' ') + ':' + (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
};


const getDateString = (date, separator='T') => { // convert to ISO 8601 format date string without seconds portion
	return date.getFullYear() + '-'
			+ ((date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1)) + '-'
			+ (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + separator
			+ (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
			+ (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
};


const shortenTokenName = (tokenName) => {
	return tokenName && ((tokenName.length > 30) ? tokenName.substring(0, 30) + '...' : tokenName);
};


const isEmptyObject = (object) => {
	return Object.keys(object).length === 0;
};


const copyText = (text, enqueueSnackbar, successCallback=(() => {}), errorCallback=(() => {})) => {
	try {
		navigator.clipboard.writeText(text);
		successCallback();
		enqueueSnackbar(`Text copied successfully`, {
			variant: 'success'
		});
	} catch(error) {
		errorCallback();
		enqueueSnackbar(`Couldn't copy text: ${error.message ? error.message : error}`, {
			variant: 'error'
		});
	}
};


const createNewTokenDialog = (dialogOpen, handleDialogClose, client, userRoles, tokens) => {
	const ONE_DAY = 1*24*60*60*1000;
	const initialExpiryDateString = getDateString(new Date(Date.now() + ONE_DAY));
	const classes = useStyles();
	const confirm = useConfirm();
    const dispatch = useDispatch();
	const [role, setRole] = React.useState('');
	const [tokenName, setTokenName] = React.useState('');
	const [validUntil, setValidUntil] = React.useState(initialExpiryDateString);
	const [loading, setLoading] = React.useState(false);
	const [createdToken, setCreatedToken] = React.useState({});
	const [tokenCopied, setTokenCopied] = React.useState(false);
	const [copyFieldBackgroundColor, setCopyFieldBackgroundColor] = React.useState('#ababab');
	const [copyFieldFontColor, setCopyFieldFontColor] = React.useState(null);
	const [validUntilError, setValidUntilError] = React.useState(null);
	const [tokenNameError, setTokenNameError] = React.useState(null);
	const userInformationMessage = 'Note that the token will not be saved in the system after generation. Please save it and keep it in a safe place';

	const { enqueueSnackbar } = useSnackbar();

	const requiredFieldsNotFilled = !tokenName || !role || !validUntil;
	const requiredFieldsChanged = tokenName || role || validUntil !== initialExpiryDateString;
	const validationErrorOccured = validUntilError || tokenNameError;


	const maxLengthOfTokenName = 30;

	const fallBackToInitialState = () => {
		setRole('');
		setTokenName('');
		setValidUntil(null);
		setLoading(false);
		setCreatedToken({});
		setTokenCopied(false);
		setCopyFieldBackgroundColor('grey');
		setCopyFieldFontColor(null);
		setValidUntilError(null);
	};

	const createToken = async () => {
		setLoading(true);
		let createdToken;
		try {
			createdToken = await client.createApplicationToken(tokenName, role, formatDateToISO8601String(stringToDate(validUntil)));
		} catch(error) {
			enqueueSnackbar(`Couldn't create a token`, {
				variant: 'error'
			});
			console.log('Issue while creating a token');
			console.error(error);
			setLoading(false);
			return;
		}
		dispatch(updateApplicationTokens([...tokens, createdToken]));
		setCreatedToken(createdToken);
		enqueueSnackbar(`Token created successfully`, {
			variant: 'success'
		});
		setLoading(false);
	};


	if (dialogOpen && validUntil === null) {
		setValidUntil(getDateString(new Date(Date.now() + ONE_DAY)));
	}


	const closeDialog = async () => {
		if(!tokenCopied && !isEmptyObject(createdToken)) {
			try {
				await confirm({
					title: 'Don\'t forget to copy the token!',
					description: `Do you want to close this dialog without copying the token? It will never be shown again`,
					cancellationButtonProps: {
						variant: 'contained'
					},
					confirmationButtonProps: {
						color: 'primary',
						variant: 'contained'
					}
				});
			} catch(error) {
				return;
			}
		}
		if (isEmptyObject(createdToken) && requiredFieldsChanged) { // if one of the requrired fields was changed and we haven't yet generatd token, then we want to preserve state when user closes dialog, so that they can start again where they left when the dialog is reopened
		} else {
			fallBackToInitialState();
		}
		handleDialogClose();
	};


	const checkThatNameUniqueness = (tokenName) => {
		for (const token of tokens) {
			if (token.name === tokenName) {
				setTokenNameError('Token with this name already exists');
				return;
			}
		}
		setTokenNameError(null);
	};

	return <>
			<Dialog fullWidth maxWidth="md" onClose={closeDialog} aria-labelledby="customized-dialog-title" open={dialogOpen}>
				<DialogTitle id="customized-dialog-title" onClose={closeDialog}>
					Create a Token
				</DialogTitle>
				<DialogContent dividers>
				<Box style={{minHeight: '300px'}}>
					{!loading ? isEmptyObject(createdToken) ? <>
							<Typography gutterBottom style={{paddingBottom: '10px'}}>
								Please enter the following information:
							</Typography>
							<Grid container>
								<Grid item xs={12}>
									<TextField
										error={!!tokenNameError}
										helperText={tokenNameError}
										fullWidth
										defaultValue={tokenName}
										id="token-name"
										label="Token Name"
										onChange={(event) => {
																checkThatNameUniqueness(event.target.value);
																setTokenName(event.target.value);
															}}
										variant="outlined"
										className={classes.textField}
										inputProps={{ maxLength: maxLengthOfTokenName }}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										fullWidth
										select
										name="role-select"
										id="role-select"
										value={role}
										variant="outlined"
										label="Role"
										onChange={(event) => setRole(event.target.value)}
										className={classes.textField}
									>
										{userRoles.map((role) => (
											<MenuItem
												key={role}
												value={role}
											>
												{role}
											</MenuItem>
										))}
									</TextField>
								</Grid>
								<Grid item xs={12}>
									<TextField
										fullWidth
										id="validuntil-datetime"
										label="Valid Until"
										type="datetime-local"
										error={validUntilError}
										helperText={validUntilError}
										defaultValue={validUntil}
										className={classes.textField}
										variant="outlined"
										onChange={(event) => {
														setValidUntil(event.target.value)
														if ((new Date()) > (new Date(event.target.value))) {
															setValidUntilError('This date cannot be in the past');
														} else {
															setValidUntilError(null);
														}
													}}
										InputLabelProps={{
											shrink: true,
										}}
									/>
								</Grid>
							</Grid>
							<Typography gutterBottom style={{paddingTop: '10px'}}>
								{userInformationMessage}
							</Typography>

					</> :
						<>
							<Grid container>
								<Grid item xs={6}>
									<TextField
										disabled
										fullWidth
										defaultValue={createdToken.name}
										id="token-name-readonly"
										label="Token Name"
										variant="filled"
										className={`${classes.textField} ${classes.paddingRight} ${classes.textfieldDisabled}`}
										inputProps={
											{ readOnly: true,
												// style: {opacity: 1}
											}
										}
									/>
								</Grid>
								<Grid item xs={6}>
								<TextField
										disabled
										fullWidth
										defaultValue={createdToken.role}
										id="token-role-readonly"
										label="Role"
										variant="filled"
										className={`${classes.textField} ${classes.paddingRight} ${classes.textfieldDisabled}`}
										inputProps={
											{ readOnly: true, }
										}
									/>
								</Grid>
								<Grid item xs={6}>
									<TextField
											disabled
											fullWidth
											defaultValue={getDateString(new Date(createdToken.validUntil))}
											id="token-validuntil-readonly"
											label="Valid Until"
											variant="filled"
											className={`${classes.textField} ${classes.paddingRight} ${classes.textfieldDisabled}`}
											inputProps={
												{ readOnly: true, }
											}
									/>
								</Grid>
								<Grid item xs={6}>
									<TextField
											disabled
											fullWidth
											defaultValue={getDateString(new Date(createdToken.issueDate))}
											id="token-issuedate-readonly"
											label="Issue Date"
											variant="filled"
											className={`${classes.textField} ${classes.paddingRight} ${classes.textfieldDisabled}`}
											inputProps={
												{ readOnly: true, }
											}
									/>
								</Grid>
								<Grid item xs={12} style={{paddingTop: '20px'}}>
									<Typography>Token:</Typography>
									<TextField
											autoFocus
											fullWidth
											defaultValue={createdToken.token}
											id="token-token-readonly"
											label=""
											variant="outlined"
											className={classes.textField}
											style={{backgroundColor: copyFieldBackgroundColor}}
											sx={{ input: { color: 'red' } }}
											InputProps={{endAdornment: <IconButton
														size="small"
														className={classes.iconButton}
														aria-label="copy token"
														onClick={() => copyText(createdToken.token,
																				enqueueSnackbar,
																				() => {
																					setCopyFieldBackgroundColor('#83f28f');
																					setCopyFieldFontColor('black');
																					setTokenCopied(true);
																				},
																				() => {
																					setCopyFieldBackgroundColor('#ffcccb');
																					setCopyFieldFontColor('black');
																				})
																}
													>
														<FileCopy fontSize="small" style={{color: copyFieldFontColor}}/>
													</IconButton>,
												readOnly: true,
												style: { color: copyFieldFontColor }}
											}
									/>
								</Grid>
							</Grid>
							<Typography gutterBottom style={{paddingTop: '10px'}}>
								{userInformationMessage}
							</Typography>
						</>
					:
					<>
						{/* <Paper container style={{minWidth: '42vw'}}> */}
						<Grid
							container
							spacing={0}
							direction="column"
							alignItems="center"
							justifyContent="center"
							style={{ minHeight: '300px' }}
						>
							<Grid item xs={3}>
								<CircularProgress color="secondary" />
							</Grid>
						</Grid>
							
					</>
					}
				</Box>
				</DialogContent>
				<DialogActions>
					<Button
						autoFocus
						onClick={isEmptyObject(createdToken) ? createToken : closeDialog}
						color="primary"
						disabled={requiredFieldsNotFilled || loading || validationErrorOccured}
					>
						{isEmptyObject(createdToken) ? "Create" : "Done"}
					</Button>
				</DialogActions>

			</Dialog>
		</>
}



const createUserTable = (tokens, classes, props, onDeleteToken) => {
	let { applicationTokensFeature, userRoles = [], onSort, sortBy, sortDirection } = props;
	const { enqueueSnackbar } = useSnackbar();

	if (!applicationTokensFeature?.error && applicationTokensFeature?.supported !== false && tokens && tokens.length > 0) {
		return <div>
			<Hidden xsDown implementation="css">
				<TableContainer component={Paper} className={classes.tableContainer}>
					<Table size="medium">
						<colgroup>
							<col key={1} style={{width:'15.5%'}}/>
							<col key={2} style={{width:'10%'}}/>
							<col key={3} style={{width:'15%'}}/>
							<col key={4} style={{width:'17%'}}/>
							<col key={5} style={{width:'17%'}}/>
							<col key={6} style={{width:'17%'}}/>
							<col key={7} style={{width:'9.5%'}}/>
						</colgroup>
						<TableHead>
							<TableRow>
								{USER_TABLE_COLUMNS.map((column) => (
									<TableCell
										key={column.id}
										sortDirection={sortBy === column.id ? sortDirection : false}
									>
										{column.key}
									</TableCell>
								))}
								<TableCell />
							</TableRow>
						</TableHead>
						<TableBody>
							{tokens &&
								tokens.map((token) => (
									<StyledTableRow
										// hover
										key={token.hash}
										// onClick={(event) => {
										// 	onSelectUser(token.hash;
										// }}
										// style={{ cursor: 'pointer' }}
									>
										<TableCell>
                                            <Tooltip title={token.name}>
                                                <TextField
                                                        className={classes.copyField}
                                                        id="token-name"
                                                        value={token.name}
                                                        InputProps={{endAdornment: <IconButton
                                                                                        size="small"
                                                                                        className={classes.iconButton}
                                                                                        aria-label="copy token name"
                                                                                        onClick={() => copyText(token.name, enqueueSnackbar)}
                                                                                    >
                                                                                        <FileCopy fontSize="small"/>
                                                                                    </IconButton>
                                                                    }}
                                                />
                                            </Tooltip>
                                        </TableCell>
										<TableCell>{token.role}</TableCell>
                                        <TableCell>
											{(token.requestedBy.length > 18) ?
												<Tooltip title={token.requestedBy}>
													<div>
														{token.requestedBy.substring(0, 18) + '...'}
													</div>
												</Tooltip> :
												<>
													{token.requestedBy}
												</>
											}
                                        </TableCell>
                                        <TableCell>{token.issueDate ? getDateString(new Date(token.issueDate)) : ''}</TableCell>
                                        <TableCell>{token.validUntil ? getDateString(new Date(token.validUntil)) : ''}</TableCell>
                                        <TableCell>{token.lastUsed ? getDateString(new Date(token.lastUsed)) : ''}</TableCell>
										<TableCell className={classes.badges}>
                                            <Tooltip title={token.hash}>
                                                <TextField
                                                    id="token-hash"
                                                    className={classes.copyField}
                                                    value={token.hash}
                                                    InputProps={{endAdornment: <IconButton
                                                                                    size="small"
                                                                                    className={classes.iconButton}
                                                                                    aria-label="copy token hash"
                                                                                    onClick={() => copyText(token.hash, enqueueSnackbar)}
                                                                                >
                                                                                    <FileCopy fontSize="small"/>
                                                                                </IconButton>
                                                                }}
                                                />
                                                {/* <AutoSuggest
                                                    disabled={user.editable === false}
                                                    suggestions={roleSuggestions}
                                                    values={user.roles?.map((role) => ({
                                                        label: role,
                                                        value: role
                                                    }))}
                                                    handleChange={(value) => {
                                                        onUpdateUserRoles(user, value);
                                                    }}
                                                /> */}
                                            </Tooltip>
										</TableCell>
										

										<TableCell align="center">
										{token.validUntil && (new Date(token.validUntil)) > (new Date()) ?
											<Tooltip title={"Token is valid"}>
											 	<EnabledIcon fontSize="small" style={{ color: green[500] }} />
										 	</Tooltip>
											:
											<Tooltip title={"Token has expired"}>
												<DisabledIcon fontSize="small" style={{ color: red[500] }} />
											</Tooltip>
										}
										</TableCell>

										<TableCell align="right">
											<Tooltip title="Revoke token">
												<IconButton
													size="small"
													onClick={(event) => {
														event.stopPropagation();
														onDeleteToken(token.hash, token.name);
													}}
												>
													<DeleteIcon fontSize="small" />
												</IconButton>
											</Tooltip>
										</TableCell>
									</StyledTableRow>
								))}
						</TableBody>
					</Table>
				</TableContainer>
			</Hidden>
			<Hidden smUp implementation="css">
				<Paper>
					<List className={classes.root}>
						{tokens.map((token) => (
							<React.Fragment key={token.hash}>
								<ListItem
									alignItems="flex-start"
								>
									<ListItemText
										primary={<span>{token.role}</span>}
										secondary={
											<React.Fragment>
												<Typography
													component="span"
													variant="body2"
													className={classes.inline}
													color="textPrimary"
												>
													{token.name && (token.name.length > 20) ? token.name.substring(0, 20) + '...' : token.name}
												</Typography>
												<span> — {token.role}</span>
											</React.Fragment>
										}
									/>
									<ListItemSecondaryAction>
										<IconButton
											edge="end"
											size="small"
											onClick={(event) => {
												event.stopPropagation();
												onDeleteUser(user.username);
											}}
											aria-label="delete"
										>
											<DeleteIcon fontSize="small" />
										</IconButton>
									</ListItemSecondaryAction>
								</ListItem>
								<Divider />
							</React.Fragment>
						))}
					</List>
				</Paper>
			</Hidden>
		</div>
	} else if (applicationTokensFeature?.error) {
		return null;
	} else {
		return <div>No tokens found</div>
	}
}

const ApplicationTokens = (props) => {
	const classes = useStyles();
	const context = useContext(WebSocketContext);
    const { client } = context;
	const dispatch = useDispatch();
	const confirm = useConfirm();
	const { enqueueSnackbar } = useSnackbar();

	const [dialogOpen, setDialogOpen] = React.useState(false);

	const handleDialogOpen = () => {
		setDialogOpen(true);
	};
	const handleDialogClose = () => {
		setDialogOpen(false);
	};

	let { applicationTokensFeature, tokens = [], userRoles = [], onSort, sortBy, sortDirection } = props;


	const onNewToken = () => {
		handleDialogOpen();
	};

	const onDeleteToken = async (tokenHash, tokenName) => {
		try {
			await confirm({
				title: 'Revoking the token',
				description: `The token will be revoked and deleted`,
				cancellationButtonProps: {
					variant: 'contained'
				},
				confirmationButtonProps: {
					color: 'primary',
					variant: 'contained'
				}
			});
		} catch(error) {
			return;
		}
		let remainingApplicationTokens;
		try {
			remainingApplicationTokens = await client.deleteApplicationToken(tokenHash);
		} catch(error) {
			console.log('Issue while revoking the token');
			console.error(error);
			enqueueSnackbar(`Couldn't revoke the token ${shortenTokenName(tokenName)}`, {
				variant: 'error'
			});
			return;
		}
		enqueueSnackbar(`Successfully revoked the token: ${shortenTokenName(tokenName)}`, {
			variant: 'success'
		});
        dispatch(updateApplicationTokens(remainingApplicationTokens));
	};

	return (
		<div>
			<Breadcrumbs aria-label="breadcrumb">
				<RouterLink className={classes.breadcrumbLink} to="/home">
					Home
				</RouterLink>
				<RouterLink className={classes.breadcrumbLink} color="inherit" to="/admin">
					Admin
				</RouterLink>
				<Typography className={classes.breadcrumbItem} color="textPrimary">
					Tokens
				</Typography>
			</Breadcrumbs>


			{applicationTokensFeature?.supported === false ? <><br/><Alert severity="warning">
				<AlertTitle>Feature not available</AlertTitle>
				Make sure that this feature is included in your MMC license.
			</Alert></> : null}
			{applicationTokensFeature?.error && applicationTokensFeature?.supported === true ? <><br/><Alert severity="warning">
				<AlertTitle>{applicationTokensFeature.error.title || 'An error has occured'}</AlertTitle>
				{applicationTokensFeature.error.message || applicationTokensFeature.error}
			</Alert></> : null}
			<br />
			{!applicationTokensFeature?.error && applicationTokensFeature?.supported !== false && <><Button
				variant="outlined"
				color="default"
				size="small"
				className={classes.button}
				startIcon={<AddIcon />}
				onClick={(event) => {
					event.stopPropagation();
					onNewToken();
				}}
			>
				New Token
			</Button>
			<br />
			<br />
			</>}
			{ createUserTable(tokens, classes, props, onDeleteToken) }
			{ createNewTokenDialog(dialogOpen, handleDialogClose, client, userRoles, tokens)}
		</div>
	);
};

ApplicationTokens.propTypes = {
	sortBy: PropTypes.string,
	sortDirection: PropTypes.string,
	onSort: PropTypes.func
};

ApplicationTokens.defaultProps = {
	sortBy: undefined,
	sortDirection: undefined
};

const mapStateToProps = (state) => {
	return {
		userProfile: state.userProfile?.userProfile,
		userRoles: state.userRoles?.userRoles,
		users: state.users?.users,
        tokens: state.tokens?.tokens,
        applicationTokensFeature: state.systemStatus?.features?.applicationtokens,
	};
};

export default connect(mapStateToProps)(ApplicationTokens);