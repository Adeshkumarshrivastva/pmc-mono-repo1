import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import pmcLogo from '../assets/logo.svg';
import { navLinks } from '../navLinks';

// PMC Brand colors
const PMC_GREEN      = '#385246';
const PMC_GREEN_DARK = '#2A3D33';
const PMC_ACCENT     = '#9BC7AE';   // soft sage for active/hover
const PMC_TEXT       = '#FFFFFF';
const PMC_SUBTEXT    = 'rgba(255,255,255,0.65)';

// PMC Logo (imported brand asset)
function PMCLogoIcon({ size = 38 }) {
  return (
    <Box
      component="img"
      src={pmcLogo}
      alt="PMC Global Academy"
      sx={{
        width: size, height: size,
        borderRadius: '50%',
        flexShrink: 0,
      }}
    />
  );
}

export default function Navbar({ user, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 20 });

  useEffect(() => setDrawerOpen(false), [location]);

  const userLabel = user?.name || (user?.email ? user.email.split('@')[0] : 'User');
  const userInitial = userLabel.charAt(0).toUpperCase();

  return (
    <>
      <AppBar
        position="fixed"
        elevation={scrolled ? 6 : 0}
        sx={{
          background: PMC_GREEN,
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
          transition: 'all 0.3s ease',
          // subtle wave overlay
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${PMC_ACCENT}, transparent)`,
            opacity: 0.5,
          },
        }}
      >
        <Toolbar sx={{ maxWidth: 1280, width: '100%', mx: 'auto', px: { xs: 2, md: 3 }, minHeight: { xs: 68, md: 80 } }}>

          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              textDecoration: 'none',
              flexGrow: { xs: 1, md: 0 },
              mr: { md: 4 },
            }}
          >
            <PMCLogoIcon size={56} />
            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', justifyContent: 'center' }}>
              <Typography sx={{ fontWeight: 800, fontSize: 19, color: PMC_TEXT, lineHeight: 1.2, letterSpacing: 0.2 }}>
                PMC
              </Typography>
              <Typography sx={{ fontSize: 12, color: PMC_SUBTEXT, lineHeight: 1.2, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>
                Global Academy
              </Typography>
            </Box>
          </Box>

          {/* Desktop nav links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, flexGrow: 1 }}>
            {navLinks.map(link => {
              const active = location.pathname === link.path;
              return (
                <Button
                  key={link.path}
                  component={Link}
                  to={link.path}
                  sx={{
                    color: active ? '#FFFFFF' : PMC_SUBTEXT,
                    fontWeight: active ? 700 : 500,
                    fontSize: 13,
                    background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                    borderRadius: 2,
                    px: 1.75,
                    minWidth: 'unset',
                    position: 'relative',
                    letterSpacing: 0.3,
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)',
                      color: '#FFFFFF',
                    },
                    ...(active && {
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 4, left: '50%',
                        transform: 'translateX(-50%)',
                        width: 20, height: 2,
                        borderRadius: 1,
                        background: PMC_ACCENT,
                      },
                    }),
                  }}
                >
                  {link.label}
                </Button>
              );
            })}
          </Box>

          {/* Auth section — desktop */}
          {user ? (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, ml: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 6, px: 1.75, py: 0.75, border: '1px solid rgba(255,255,255,0.15)' }}>
                {/* Avatar circle */}
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', background: PMC_ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: PMC_GREEN_DARK }}>{userInitial}</Typography>
                </Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600, color: PMC_TEXT }}>{userLabel}</Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={onLogout}
                sx={{
                  borderRadius: 6, px: 2.5,
                  color: PMC_TEXT,
                  borderColor: 'rgba(255,255,255,0.35)',
                  fontSize: 12,
                  '&:hover': { borderColor: PMC_TEXT, background: 'rgba(255,255,255,0.1)' },
                }}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, ml: 2 }}>
              <Button
                component={Link} to="/login"
                size="small"
                sx={{ color: PMC_TEXT, fontSize: 13, px: 2, borderRadius: 6, '&:hover': { background: 'rgba(255,255,255,0.1)' } }}
              >
                Login
              </Button>
              <Button
                component={Link} to="/register"
                variant="contained"
                size="small"
                sx={{
                  background: PMC_ACCENT, color: PMC_GREEN_DARK,
                  fontWeight: 700, fontSize: 13, px: 2.5, borderRadius: 6,
                  '&:hover': { background: '#8ECFB0' },
                  boxShadow: 'none',
                }}
              >
                Get Started
              </Button>
            </Box>
          )}

          {/* Hamburger — mobile */}
          <IconButton
            sx={{ display: { md: 'none' }, color: PMC_TEXT, ml: 1 }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Spacer */}
      <Toolbar sx={{ minHeight: { xs: 60, md: 68 } }} />

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: PMC_GREEN,
            color: PMC_TEXT,
          },
        }}
      >
        <Box>
          {/* Drawer header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <PMCLogoIcon size={44} />
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography sx={{ fontWeight: 800, fontSize: 16, color: PMC_TEXT, lineHeight: 1.2 }}>PMC</Typography>
                <Typography sx={{ fontSize: 11, color: PMC_SUBTEXT, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 600 }}>Global Academy</Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ color: PMC_TEXT }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

          {/* Nav links */}
          <List dense disablePadding sx={{ py: 1 }}>
            {navLinks.map(link => {
              const active = location.pathname === link.path;
              return (
                <ListItem key={link.path} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={link.path}
                    sx={{
                      py: 1.4, px: 2.5,
                      background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                      borderLeft: active ? `3px solid ${PMC_ACCENT}` : '3px solid transparent',
                      '&:hover': { background: 'rgba(255,255,255,0.08)' },
                    }}
                  >
                    <ListItemText
                      primary={link.label}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: active ? 700 : 500,
                        color: active ? PMC_TEXT : PMC_SUBTEXT,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

          {/* User section */}
          <Box sx={{ px: 2.5, pt: 2.5, pb: 3 }}>
            {user ? (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: '50%', background: PMC_ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: PMC_GREEN_DARK }}>{userInitial}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: PMC_TEXT }}>{userLabel}</Typography>
                    <Typography sx={{ fontSize: 11, color: PMC_SUBTEXT }}>Logged in</Typography>
                  </Box>
                </Box>
                <Button
                  fullWidth variant="outlined" onClick={onLogout}
                  sx={{
                    borderRadius: 2, color: PMC_TEXT,
                    borderColor: 'rgba(255,255,255,0.3)',
                    '&:hover': { borderColor: PMC_TEXT, background: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  fullWidth component={Link} to="/login"
                  variant="outlined"
                  sx={{ borderRadius: 2, color: PMC_TEXT, borderColor: 'rgba(255,255,255,0.3)', '&:hover': { background: 'rgba(255,255,255,0.08)' } }}
                >
                  Login
                </Button>
                <Button
                  fullWidth component={Link} to="/register"
                  variant="contained"
                  sx={{ borderRadius: 2, background: PMC_ACCENT, color: PMC_GREEN_DARK, fontWeight: 700, '&:hover': { background: '#8ECFB0' }, boxShadow: 'none' }}
                >
                  Get Started
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
