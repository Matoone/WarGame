// Created by Matoone
/*
    Prenez le contrôle des points "diamant" pour générer de l'argent.
    Cliquez sur la base bleue pour ouvrir le menu de construction.
    Choisissez l'unité à construire (actuellement implémentés: rifleman, grenadier, sniper, shield)
    Sélectionnez les unités en faisant une dragbox autour d'eux, de gauche à droite et de bas en haut.
            Vous pouvez filtrer les unités alors sélectionnées:
                                            - avec ctrl pour les déselectionner tous
                                            - avec 1 pour ne sélectionner que les riflemen, 2 pour les grenadiers etc...
    Envoyez les unités selectionnées sur un point en cliquant dessus.

    Chaque unité a des forces et des faiblesses, tirez en parti !
*/

let canvas;
let ctx;
let rect;

let soldier_png;
let rifle_png;
let rifle_red_png;
let rifle_blue_png;

let sniper_png;
let sniper_red_png;
let sniper_blue_png;

let grenade_png;
let military_base_png;
let mortar_png;
let tank_png;
let shooting_png;
let bomb_png;
let explosion_png;
let grenade_blue_png;
let grenade_red_png;
let shield_png;
let shield_blue_png;
let shield_red_png;
let diamond_png;
let diamond_blue_png;
let diamond_red_png;

let redSoldiersCount = 0;
let blueSoldiersCount = 0;

const DELAY  = 50;
const TILE_SIZE = 1;
const C_WIDTH = 1280;
const C_HEIGHT = 3072;
const SYS_DELAY = 40;
const CIRCLE_RADIUS = 20.00;
const ATTACK_DELAY = 300;
const GRENADE_SPEED_MULT = 6;
const EXPLOSION_RADIUS = 60;
const GRENADE_DAMAGE = 25;
const GRENADE_ATTACK_DELAY = 70;
const SNIPER_ATTACK_DELAY = 60;
const BASE_HP = 1000;
const BOMB_VS_BUILDING_BONUS = 3;
const CAP_RANGE = 80;
const CAPTURE_TIME = 1200;


const AI_SQUAD_REACTION_RANGE = 6 * C_HEIGHT;
const AI_SQUAD_REACTION_RANGE_SEEKFORALLIEDENEMIES = 6 * C_HEIGHT;


const ISWALKING_SHOOT_MALUS = 0.7;
const DIST_BETWEEN_UNITS = 36;
const DIST_BETWEEN_UNITS_STRAIGHT = 20;
const DIST_TOLERANCE = 12;
const DIST_TO_DEST_TOLERANCE = 45;

const RIFLEMAN_COST = 100;
const GRENADIER_COST = 150;
const SNIPER_COST = 200;
const SHIELD_COST = 250;

const RIFLEMAN_HP = 100;
const GRENADIER_HP = 100;
const SNIPER_HP = 70;
const SHIELDMAN_HP = 70;

const RIFLEMAN_RANGE = 100;
const GRENADIER_RANGE = 250;
const SNIPER_RANGE = 400;
const RIFLEMAN_DMG = 2;
const SNIPER_DMG = 20;
const RIFLEMAN_RATE_OF_FIRE = 1;

const RIFLEMAN_SPEED = 3;
const GRENADIER_SPEED = 2;
const SNIPER_SPEED = 2;
const SHIELDMAN_SPEED = 1;

const SHIELD_MAX_HP = 200;
const SHIELD_RANGE = 200;
const SHIELD_REGEN_TRESHOLD = 100;
const SHIELD_REGEN_AMOUNT = 5;

const START_MONEY = 600;

const MONEY_GENERATION = 10;
const MONEY_TRESHOLD = 100;

const NBR_OF_LITTLE_RESOURCESPOTS = 3;
const NBR_OF_MEDIUM_RESOURCESPOTS = 1;
const NBR_OF_BIG_RESOURCESPOTS = 1;

const MEDIUM_RESOURCE_POINT_OFFSET = 250;

let bluePlayer;
let redPlayer;
let neutralPlayer;

let soldiers;
let blueSoldiers = [];
let redSoldiers = [];
let neutralSoldiers = [];

let buildings;
let explosives;
let weapons;

let resourcesSpots;
let blueResourcesSpots = [];
let redResourcesSpots = [];
let neutralResourcesPoints = [];

let blueBaseSoldier;
let blueBase;
let blueBaseStatus;
let blueBaseSoldierStatus;
let blueBaseSoldierWeapon;

let redBaseSoldier;
let redBaseSoldierWeapon;
let redBaseSoldierStatus;
let redBaseStatus;
let redBase;

let clickableElements = [];

let pos = {};
let md_pos = {};
let mu_pos = {};

let buildingMenu = new Array();
let isInBuildingMenu = false;

let dest = null;
isDestinationListenerAdded = false;

let nbrCount = -1;


let blueMoneyButton;
let blueSoldiersButton;
let bluePointsControlled;

class player {
    constructor(color)
    {
        this.color = color;
        this.money = START_MONEY;
    }
}
class status{
    constructor(isSelected, isWalking, isIdle, isFighting, isUnderFire, x, y, destX, destY)
    {
        
        this.isSelected = isSelected;
        this.isWalking = isWalking;
        this.isIdle = isIdle;
        this.isFighting = isFighting;
        this.isUnderFire = isUnderFire;
        this.x = x;
        this.y = y;
        this.destX = destX;
        this.destY = destY;
    }

}
class slot
{
    constructor(isFree, x, y)
    {
        this.isFree = isFree;
        this.x = x;
        this.y = y;
    }
}
class baseSlots
{
    constructor(slot1, slot2, slot3, slot4)
    {
        this.slot1 = slot1;
        this.slot2 = slot2;
        this.slot3 = slot3;
        this.slot4 = slot4;
    }
}
class base
{
    constructor(player, image, hp, attachedSoldier, level, status, baseSlots)
    {
        this.player = player;
        this.image = image;
        this.hp = hp;
        this.attachedSoldier = attachedSoldier;
        this.level = level;
        this.status = status;
        this.baseSlots = baseSlots;
        this.captureProgression = 0;
    }
    returnShield()
    {
        for(let i=0; i<soldiers.length; i++)
        {
            if(soldiers[i].player.color == this.player.color)
            {
                if(soldiers[i].type == "shieldman")
                {
                    let z = Math.hypot(soldiers[i].status.x - this.status.x, soldiers[i].status.y - this.status.y);
                    if(((z <= soldiers[i].shield.range) && (z>=0)) || ((z>= soldiers[i].shield.range) && (z < 0)))
                    {
                        return soldiers[i].shield;
                    }
                }
            }
        }
    }
    isIntersect(point)
    {
        return Math.sqrt(((point.x-16) - this.status.x) ** 2 + ((point.y-16) - this.status.y) ** 2) < CIRCLE_RADIUS;
    }
    checkSlots()
    {
        
            for(let j=0; j<this.baseSlots.length; j++)
            {
                this.baseSlots[j].isFree = true;

                for(let i=0; i<soldiers.length; i++)
                {   
                    if((soldiers[i].status.x == this.baseSlots[j].x) && (soldiers[i].status.y == this.baseSlots[j].y))
                    {
                        this.baseSlots[j].isFree = false;
                    }
                
                }
            }
    }
}

class soldier {
    constructor(player, type, image, hp, speed, weapon, status, nbr, threatLevel)
    {
        this.player = player;
        this.type = type;
        this.image = image;
        this.hp = hp;
        
        this.speed = speed;
        this.weapon = weapon;
        this.status = status;
        this.nbr = nbr;
        this.threatLevel = this.threatLevel;
        this.squad = null;
    }

    isShielded(shield)
    {
        let z= Math.hypot(shield.soldier.status.x - this.status.x, shield.soldier.status.y - this.status.y);
        if(((z <= shield.range) && (z>=0)) || ((z>= shield.range) && (z < 0)))
        {
            return true;
        }
        else
        {
            return false;
        }
    }
    returnShield()
    {
        for(let i=0; i<soldiers.length; i++)
        {
            if(soldiers[i].player.color == this.player.color)
            {
                if(soldiers[i].type == "shieldman")
                {
                    let z = Math.hypot(soldiers[i].status.x - this.status.x, soldiers[i].status.y - this.status.y);
                    if(((z <= soldiers[i].shield.range) && (z>=0)) || ((z>= soldiers[i].shield.range) && (z < 0)))
                    {
                        return soldiers[i].shield;
                    }
                }
            }
        }
    }
    checkDistances()
    {
        for(let i=0; i<soldiers.length; i++)
        {
            if((soldiers[i].status.isWalking == false) && (this.status.isWalking == false))
            {
                if(soldiers[i] != this)
                {
                    let z = Math.hypot(soldiers[i].status.x - this.status.x, soldiers[i].status.y - this.status.y);

                    if(soldiers[i].player.color == this.player.color)
                    {
                        if(((z <= DIST_BETWEEN_UNITS) && (z>=0)) || ((z>= DIST_BETWEEN_UNITS) && (z < 0)))
                        {
                            //this.tempDestX = this.status.destX;
                           // this.tempsDestY = this.status.destY;
                           let currentDistToObj = Math.hypot(this.status.destX - this.status.x, this.status.destY - this.status.y);
                           if(((currentDistToObj <= DIST_TO_DEST_TOLERANCE) && (currentDistToObj>=0)) || ((currentDistToObj>= DIST_TO_DEST_TOLERANCE) && (currentDistToObj < 0)))
                           {
                               
                            this.status.destX =null;
                            this.status.destY =null;
                           }
                            if(soldiers[i].status.x == this.status.x)
                            {
                                let r = Math.random();
                                if(r <= 0.5)
                                {
                                this.moveLeft();
                                }
                                else
                                {
                                this.moveRight();
                                }
                            }

                            if(soldiers[i].status.y == this.status.y)
                            {
                                let r = Math.random();
                                if(r <= 0.5)
                                {
                                this.moveUp();
                                }
                                else
                                {
                                this.moveDown();
                                }
                            }

                            if((soldiers[i].status.x > this.status.x) && (soldiers[i].status.x - this.status.x <= DIST_BETWEEN_UNITS_STRAIGHT))
                            {
                                this.moveLeft();
                            }
                            if((soldiers[i].status.x < this.status.x) && (this.status.x - soldiers[i].status.x <= DIST_BETWEEN_UNITS_STRAIGHT))
                            {
                                this.moveRight();
                            }
                            if((soldiers[i].status.y > this.status.y) && (soldiers[i].status.y - this.status.y <= DIST_BETWEEN_UNITS_STRAIGHT))
                            {
                                this.moveUp();
                            }
                            if((soldiers[i].status.y < this.status.y) && (this.status.y - soldiers[i].status.y <= DIST_BETWEEN_UNITS_STRAIGHT))
                            {
                                this.moveDown();
                            }
                        }
                    }
                }
            }
        }
    }
    isInsideBox(mdpos, mupos)
    {
        if((this.status.x+15 >= mdpos.x) && (this.status.x+15 <= mupos.x))
        {
            if((this.status.y+15 >= mdpos.y) && (this.status.y+15 <= mupos.y))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }
    captureBase(base)
    {
        console.log(this + " is capturing " + base);
    }
    isIntersect(point)
    {
        return Math.sqrt(((point.x-16) - this.status.x) ** 2 + ((point.y-16) - this.status.y) ** 2) < CIRCLE_RADIUS;
    }

    moveUp()
    {
        if(this.speed == 1)
        {
        this.status.y -= TILE_SIZE;
        }
        else if(this.speed == 2)
        {
        this.status.y -= TILE_SIZE;
            if(this.status.y > this.status.destY)
            {
            this.status.y -= TILE_SIZE;    
            }
        }
        else if(this.speed == 3)
        {
            this.status.y -= TILE_SIZE;
                if(this.status.y > this.status.destY)
                {
                this.status.y -= TILE_SIZE;    
                }
                if(this.status.y > this.status.destY)
                {
                this.status.y -= TILE_SIZE;    
                }
        }
    }

    moveDown()
    {
        //this.status.y += TILE_SIZE;
        if(this.speed == 1)
        {
        this.status.y += TILE_SIZE;
        }
        else if(this.speed == 2)
        {
        this.status.y += TILE_SIZE;
            if(this.status.y < this.status.destY)
            {
            this.status.y += TILE_SIZE;    
            }
        }
        else if(this.speed == 3)
        {
            this.status.y += TILE_SIZE;
                if(this.status.y < this.status.destY)
                {
                this.status.y += TILE_SIZE;    
                }
                if(this.status.y < this.status.destY)
                {
                this.status.y += TILE_SIZE;    
                }
        }
    }

    

    moveLeft()
    {
        //this.status.x -= TILE_SIZE;
        if(this.speed == 1)
        {
        this.status.x -= TILE_SIZE;
        }
        else if(this.speed == 2)
        {
        this.status.x -= TILE_SIZE;
            if(this.status.x > this.status.destX)
            {
            this.status.x -= TILE_SIZE;    
            }
        }
        else if(this.speed == 3)
        {
            this.status.x -= TILE_SIZE;
                if(this.status.x > this.status.destX)
                {
                this.status.x -= TILE_SIZE;    
                }
                if(this.status.x > this.status.destX)
                {
                this.status.x -= TILE_SIZE;    
                }
        }
    }
    

    moveRight()
    {
        //this.status.x += TILE_SIZE;
        if(this.speed == 1)
        {
        this.status.x += TILE_SIZE;
        }
        else if(this.speed == 2)
        {
        this.status.x += TILE_SIZE;
            if(this.status.x < this.status.destX)
            {
            this.status.x += TILE_SIZE;    
            }
        }
        else if(this.speed == 3)
        {
            this.status.x += TILE_SIZE;
                if(this.status.x < this.status.destX)
                {
                this.status.x += TILE_SIZE;    
                }
                if(this.status.x < this.status.destX)
                {
                this.status.x += TILE_SIZE;    
                }
        }
    }

    moveTo(x, y)
    {
    if((this.status.x != x) || (this.status.y != y ))
    {
    let o = Math.hypot(this.status.x - x, this.status.y - y);       
        if(((o >= DIST_TOLERANCE ) && (o>=0)) || ((o <=DIST_TOLERANCE ) && (o < 0)))
        {
        drawCoordinates(x,y);
            if((this.status.isWalking == false) || (this.status.isIdle = true))
            {
            this.status.isWalking = true;
            this.status.isIdle = false;
            }    

            if((this.status.x < x) && (this.status.y < y))
            {
            setTimeout(this.moveDown(), DELAY);
            setTimeout(this.moveRight(), DELAY);
            }

            else if((this.status.x > x) && (this.status.y < y))
            {
            setTimeout(this.moveDown(), DELAY);
            setTimeout(this.moveLeft(), DELAY);
            }

            else if((this.status.x > x) && (this.status.y > y))
            {
            setTimeout(this.moveUp(), DELAY);
            setTimeout(this.moveLeft(), DELAY);
            }

            else if((this.status.x < x) && (this.status.y > y))
            {
            setTimeout(this.moveUp(), DELAY);
            setTimeout(this.moveRight(), DELAY);
            }
            else if((this.status.x == x) && (this.status.y < y))
            {
                    //console.log(soldier.type + " is Moving down!")
            setTimeout(this.moveDown(), DELAY);
                    
            }
            else if((this.status.x == x) && (this.status.y > y))
            {
                    //console.log(soldier.type + " is Moving up!")
            setTimeout(this.moveUp(), DELAY);
            }
            else if((this.status.x < x) && (this.status.y == y))
            {
                    //console.log(soldier.type + " is Moving right!")
            setTimeout(this.moveRight(), DELAY);
            }
            else if((this.status.x > x) && (this.status.y == y))
            {
            //console.log(soldier.type + " is Moving left!")
             setTimeout(this.moveLeft(), DELAY);
            }
            else
            {
             console.log("Erreur! l.67")
            
            }
        }
        else
        {
            //dest = null;
            //console.log("arrived at destination!");
            this.status.isWalking = false;
            this.status.isIdle = true;
            this.destX = null;
            this.destY = null;
        }
    }
        
    }
}


class weapon {
    constructor(type, soldier, image, range, dmg, rateOfFire, shootingPng, underFirePng, readyToShoot, counter)
    {
        this.type = type;
        this.soldier = soldier;
        this.image = image;
        this.range = range;
        this.dmg = dmg;
        this.rateOfFire = rateOfFire;
        this.shootingPng = shootingPng;
        this.underFirePng = underFirePng;
        this.readyToShoot = readyToShoot;
        this.counter = counter;
    }
    shoot(target)
    {
        if(target.hp >=0)
        {
            target.status.isUnderFire = false;
            if(this.type == "rifle")
            {
                target.status.isUnderFire = true; 
                ctx.drawImage(this.shootingPng, this.soldier.status.x + 8, this.soldier.status.y -20);
                ctx.drawImage(under_fire_png, target.status.x + 8, target.status.y +45);
                // console.log(this.soldier.type + "team " + this.soldier.player.color + " is fighting against  :" + target.type + "team " + target.player.color + "and made : " + (this.dmg * (this.rateOfFire)/10) + " damages");
                if(this.soldier.status.isWalking)
                {
                    if(target.returnShield())
                    {
                    let shield = target.returnShield();
                    let z = Math.hypot(this.soldier.status.x - shield.soldier.status.x, this.soldier.status.y - shield.soldier.status.y);
                        if(((z <= shield.range) && (z>=0)) || ((z>= shield.range) && (z < 0)))
                        {
                        target.hp -= ((this.dmg * (this.rateOfFire)/10) * (ISWALKING_SHOOT_MALUS));
                        
                        }
                        else if(((z >= shield.range) && (z>=0)) || ((z<= shield.range) && (z < 0)))
                        {
                        shield.currentHp -= ((this.dmg * (this.rateOfFire)/10) * (ISWALKING_SHOOT_MALUS));
                        }
                    }
                    else
                    {
                    target.hp -= ((this.dmg * (this.rateOfFire)/10) * (ISWALKING_SHOOT_MALUS)); 
                       
                    }      
                }           
                else
                {
                    if(target.returnShield())
                    {
                    let shield = target.returnShield();
                    let z = Math.hypot(this.soldier.status.x - shield.soldier.status.x, this.soldier.status.y - shield.soldier.status.y);
                        if(((z <= shield.range) && (z>=0)) || ((z>= shield.range) && (z < 0)))
                        {
                        target.hp -= ((this.dmg * (this.rateOfFire)/10));
                        
                        }
                        else if(((z >= shield.range) && (z>=0)) || ((z<= shield.range) && (z < 0)))
                        {
                        shield.currentHp -= ((this.dmg * (this.rateOfFire)/10));
                        }
                    }
                    else
                    {
                    target.hp -= ((this.dmg * (this.rateOfFire)/10));
                       
                    }      
                }
            }
            else if(this.type == "grenades")
            {
                target.status.isUnderFire = true; 
                
                if(this.readyToShoot == true)
                {

                
                    //let bombImg = ctx.drawImage(bomb_png, this.soldier.status.x +8, this.soldier.status.y +8);
                    let bomb = new explosiveProjectile(this, this.soldier.status.x +8, this.soldier.status.y +8, target.status.x +8, target.status.y +8, EXPLOSION_RADIUS, GRENADE_DAMAGE);
                    explosives.push(bomb);
                    this.readyToShoot = false;
                    this.counter = 0;
                    
                    

                }
                else
                {
                    
                }

            }

            else if(this.type == "sniper")
            {
                if(this.soldier.status.isWalking == false)
                {
                    target.status.isUnderFire = true; 
                    if(this.readyToShoot == true)
                    {

                    
                        //let bombImg = ctx.drawImage(bomb_png, this.soldier.status.x +8, this.soldier.status.y +8);
                        target.hp -= this.dmg;
                        
                        console.log(this.soldier.type + " HIT " + target.type + this.dmg + " DMG");
                        
                        this.readyToShoot = false;
                        this.counter = 0;
                        

                    }
                    else
                    {
                       
                    }
                }

            }
            
            //setTimeout(this.shoot(target), (DELAY / this.rateOfFire));
        }
        else
        {
        
            this.soldier.status.isFighting = false;
        }
    }
    checkTargets()
    {
        
        if(this.soldier.player.color == "blue")
        {
            for( let i=0; i<soldiers.length; i++)
            {
                let z = Math.hypot(soldiers[i].status.x - this.soldier.status.x, soldiers[i].status.y - this.soldier.status.y);
                if(((z <= this.range) && (z>0)) || ((z>= this.range) && (z < 0)))
                {
                    if(this.soldier.status.isFighting == false)
                    {
                        if((soldiers[i].player.color == "red") ||(soldiers[i].player.color == "black"))
                        {
                            this.soldier.status.isFighting = true;
                            setTimeout(this.shoot(soldiers[i]), ATTACK_DELAY);
                            
                        }
                    }
                    else
                    {
                        
                    }
                }
            }
            for(let j=0; j<buildings.length; j++)
            {
                let zz = Math.hypot(buildings[j].status.x - this.soldier.status.x, buildings[j].status.y - this.soldier.status.y);
                if(((zz <= this.range)&& (zz>0)) || ((zz>= this.range) && (zz < 0)))
                {
                    if(this.soldier.status.isFighting == false)
                    {
                        if((buildings[j].player.color == "red") || (buildings[j].player.color == "black"))
                        {
                            this.soldier.status.isFighting = true;
                            setTimeout(this.shoot(buildings[j]), ATTACK_DELAY);
                            
                        }
                    }
                    else
                    {

                    }
                }
                
            }
            for( let k=0; k<soldiers.length; k++)
            {
                soldiers[k].status.isFighting = false;
            }
            
            
          /*  soldiers.array.forEach(element => 
            {
                let z = Math.hypot(element.status.x - this.soldier.status.x, element.status.y - this.soldier.status.y) //Math.sqrt(Math.pow((element.status.x - this.soldier.status.x),2) + (Math.pow((element.status.y - this.soldier.status.y),2)));
                if(((z <= this.range) && (z > 0)) || ((z >= this.range) && (z < 0)))
                {
                    if(element.player.color == "red")
                        {
                        this.shoot(element);
                        }
                }
            });
            
            buildings.array.forEach(element => 
                {
                    let z = Math.hypot(element.status.x - this.soldier.status.x, element.status.y - this.soldier.status.y) //Math.sqrt(Math.pow((element.status.x - this.soldier.status.x),2) + (Math.pow((element.status.y - this.soldier.status.y),2)));
                    if(((z <= this.range) && (z > 0)) || ((z >= this.range) && (z < 0)))
                    {
                        if(element.player.color == "red")
                            {
                            this.shoot(element);
                            }
                    }
                });
                */
        }
        else if(this.soldier.player.color == "red")
        {
            for( let i=0; i<soldiers.length; i++)
            {
                let z = Math.hypot(soldiers[i].status.x - this.soldier.status.x, soldiers[i].status.y - this.soldier.status.y);
                if(((z <= this.range) && (z>0)) || ((z>= this.range) && (z < 0)))
                {
                    if(this.soldier.status.isFighting == false)
                    {
                        if((soldiers[i].player.color == "blue") || (soldiers[i].player.color == "black"))
                        {
                            this.soldier.status.isFighting = true;
                            setTimeout(this.shoot(soldiers[i]), ATTACK_DELAY);
                            
                        }
                    }
                    else
                    {
                        
                    }
                }
            }
            for(let j=0; j<buildings.length; j++)
            {
                let zz = Math.hypot(buildings[j].status.x - this.soldier.status.x, buildings[j].status.y - this.soldier.status.y);
                if(((zz <= this.range)&& (zz>0)) || ((zz>= this.range) && (zz < 0)))
                {
                    if(this.soldier.status.isFighting == false)
                    {
                        if((buildings[j].player.color == "blue") || (buildings[j].player.color == "black"))
                        {
                            this.soldier.status.isFighting = true;
                            setTimeout(this.shoot(buildings[j]), ATTACK_DELAY);
                            
                        }
                    }
                    else
                    {

                    }
                }
                
            }
            for( let k=0; k<soldiers.length; k++)
            {
                soldiers[k].status.isFighting = false;
            }
        }
        else
        {
            console.log("Erreur! L'arme n'a pas de couleur assignée!");
        }
    }
}

class explosiveProjectile {
    constructor(weapon, x, y, destX, destY, explosionRadius, dmg)
    {
        this.weapon = weapon;
        this.x = x;
        this.y = y;
        this.destX = destX;
        this.destY = destY;
        this.explosionRadius = explosionRadius;
        this.dmg = dmg;
    }
    explode()
    {
        console.log("explosion at: " + this.x + " / " + this.y);
        //this.weapon.readyToShoot = true;
        for( let i=0; i<soldiers.length; i++)
        {
            let z = Math.hypot(soldiers[i].status.x - this.x, soldiers[i].status.y - this.y);
            if(z<= this.explosionRadius)
            {
                soldiers[i].hp -= this.dmg;
                console.log(soldiers[i].type + " TOOK " + this.dmg + " damages !");
            }
        }
        for(let j = 0 ; j<buildings.length; j++)
        {
            let z = Math.hypot(buildings[j].status.x - this.x, buildings[j].status.y - this.y);
            if(z <= this.explosionRadius)
            {
                buildings[j].hp -= this.dmg * BOMB_VS_BUILDING_BONUS;
            }
        }
        
    }
    moveUp()
    {
        for(let i=0; i<GRENADE_SPEED_MULT; i++)
        {
            if(this.y > this.destY)
            {
                this.y -= TILE_SIZE;
            }
            else
            {

            }
        }
    }

    moveDown()
    {
        for(let i=0; i<GRENADE_SPEED_MULT; i++)
        {
            if(this.y < this.destY)
            {
                this.y += TILE_SIZE;
            }
            else
            {

            }
        }
    }

    moveLeft()
    {

        for(let i=0; i<GRENADE_SPEED_MULT; i++)
        {
            if(this.x > this.destX)
            {
                this.x -= TILE_SIZE;
            }
            else
            {

            }
        }
        
    }

    moveRight()
    {
        for(let i=0; i<GRENADE_SPEED_MULT; i++)
        {
            if(this.x < this.destX)
            {
                this.x += TILE_SIZE;
            }
            else
            {

            }
        }
        
        
    }

    moveTo(x, y)
    {
        if((this.weapon.soldier.x-x != x) || (this.weapon.soldier.y != y ))
        {


            if((this.weapon.soldier.status.x < x) && (this.weapon.soldier.status.y < y))
            {
            setTimeout(this.moveDown(), DELAY);
            setTimeout(this.moveRight(), DELAY);
            }

            else if((this.weapon.soldier.status.x > x) && (this.weapon.soldier.status.y < y))
            {
            setTimeout(this.moveDown(), DELAY);
            setTimeout(this.moveLeft(), DELAY);
            }

            else if((this.weapon.soldier.status.x > x) && (this.weapon.soldier.status.y > y))
            {
            setTimeout(this.moveUp(), DELAY);
            setTimeout(this.moveLeft(), DELAY);
            }

            else if((this.weapon.soldier.status.x < x) && (this.weapon.soldier.status.y > y))
            {
            setTimeout(this.moveUp(), DELAY);
            setTimeout(this.moveRight(), DELAY);
            }
            else if((this.weapon.soldier.status.x == x) && (this.weapon.soldier.status.y-1 < y))
            {
                    //console.log(soldier.type + " is Moving down!")
            setTimeout(this.moveDown(), DELAY);
            setTimeout(this.moveDown(), DELAY);
                        
            }
            else if((this.weapon.soldier.status.x == x) && (this.weapon.soldier.status.y < y))
            {
                    //console.log(soldier.type + " is Moving down!")
            setTimeout(this.moveDown(), DELAY);
            
                        
            }
            else if((this.weapon.soldier.status.x == x) && (this.weapon.soldier.status.y+1 > y))
            {
                    //console.log(soldier.type + " is Moving up!")
            setTimeout(this.moveUp(), DELAY);
            setTimeout(this.moveUp(), DELAY);
            }
            else if((this.weapon.soldier.status.x == x) && (this.weapon.soldier.status.y > y))
            {
                    //console.log(soldier.type + " is Moving up!")
            setTimeout(this.moveUp(), DELAY);
            
            }
            else if((this.weapon.soldier.status.x-1 < x) && (this.weapon.soldier.status.y == y))
            {
                    //console.log(soldier.type + " is Moving right!")
            setTimeout(this.moveRight(), DELAY);
            setTimeout(this.moveRight(), DELAY);
            }
            else if((this.weapon.soldier.status.x < x) && (this.weapon.soldier.status.y == y))
            {
                    //console.log(soldier.type + " is Moving right!")
            setTimeout(this.moveRight(), DELAY);
            
            }
            else if((this.weapon.soldier.status.x+1 > x) && (this.weapon.soldier.status.y == y))
            {
            //console.log(soldier.type + " is Moving left!")
             setTimeout(this.moveLeft(), DELAY);
             setTimeout(this.moveLeft(), DELAY);
            }
            else if((this.weapon.soldier.status.x > x) && (this.weapon.soldier.status.y == y))
            {
            //console.log(soldier.type + " is Moving left!")
             setTimeout(this.moveLeft(), DELAY);
             
            }
            else
            {
             console.log("Erreur!")
            
            }



            /* if((this.x < x) && (this.y < y))
                {
                    let r = Math.random();
                    if(r < 0.5)
                    {
                    //console.log(soldier.type + " is Moving down!")
                    setTimeout(this.moveDown(), DELAY);
                    }
                    else if (r >= 0.5)
                    {
                    //console.log(soldier.type + " is Moving right!")
                    setTimeout(this.moveRight(), DELAY);
                    }
                    else
                    {
                        console.log("Error !")
                    }

                    
                }

            else if((this.x > x) && (this.y < y))
            {
                    let r = Math.random();
                    if(r < 0.5)
                    {
                   // console.log(soldier.type + " is Moving down!")
                    setTimeout(this.moveDown(), DELAY);
                    }
                    else if (r >= 0.5)
                    {
                    //console.log(soldier.type + " is Moving left!")
                    setTimeout(this.moveLeft(), DELAY);
                    }
                    else
                    {
                        console.log("Error !")
                    }
            }

            else if((this.x > x) && (this.y > y))
            {
                    let r = Math.random();
                    if(r < 0.5)
                    {
                    //console.log(soldier.type + " is Moving up!")
                    setTimeout(this.moveUp(), DELAY);
                    }
                    else if (r >= 0.5)
                    {
                    //console.log(soldier.type + " is Moving left!")
                    setTimeout(this.moveLeft(), DELAY);
                    }
                    else
                    {
                        console.log("Error !")
                    }
            }

            else if((this.x < x) && (this.y > y))
            {
                    let r = Math.random();
                    if(r < 0.5)
                    {
                    //console.log(soldier.type + " is Moving up!")
                    setTimeout(this.moveUp(), DELAY);
                    }
                    else if (r >= 0.5)
                    {
                    //console.log(soldier.type + " is Moving right!")
                    setTimeout(this.moveRight(), DELAY);
                    }
                    else
                    {
                        console.log("Error !")
                    }
            }
            else if((this.x == x) && (this.y < y))
            {
                    //console.log(soldier.type + " is Moving down!")
                    setTimeout(this.moveDown(), DELAY);
                    
            }
            else if((this.x == x) && (this.y > y))
            {
                    //console.log(soldier.type + " is Moving up!")
                    setTimeout(this.moveUp(), DELAY);
            }
            else if((this.x < x) && (this.y == y))
            {
                    //console.log(soldier.type + " is Moving right!")
                    setTimeout(this.moveRight(), DELAY);
            }
            else if((this.x > x) && (this.y == y))
            {
                    //console.log(soldier.type + " is Moving left!")
                    setTimeout(this.moveLeft(), DELAY);
            }
            else
            {
                    console.log("Erreur!")
            } */
        }
        else
        {
            
        }

    }
    
}

class menuButton {
    constructor(name, status, cost)
    {
        this.name = name;
        this.status = status;
        this.cost = cost;
    }
    isIntersect(point)
    {
        if((point.x < this.status.x -4) || (point.x > this.status.x +55) || (point.y < this.status.y - 10) || (point.y > this.status.y +10))
        {
            return false;
        }
        else
        {
            return true;
        }
      //  return Math.sqrt((point.x - this.status.x) ** 2 + (point.y - this.status.y) ** 2) < CIRCLE_RADIUS;
    }
}

class resourcesSpot{
    constructor(player, status, size)
    {
        this.player = player;
        this.status = status;
        this.size = size;
        this.count = 0;
        this.captureProgression = 0;
        this.isBeingCaptured = false;
        this.image = diamond_png;
    }
    generateMoney()
    {
        if(this.count < MONEY_TRESHOLD)
        {
            this.count++;
        }
        else
        {
            this.player.money += MONEY_GENERATION * this.size;
            this.count = 0;
        }
        
    }
}

class shield{
    constructor(soldier){
        this.soldier = soldier;
        this.maxHp = SHIELD_MAX_HP;
        this.currentHp = this.maxHp;
        this.range = SHIELD_RANGE;
        this.counter = 0;
        this.isRegenerating = false;
    }
    regenerateShield()
    {
        if(this.counter < SHIELD_REGEN_TRESHOLD)
        {
            this.counter++;
        }
        else if(this.counter >= SHIELD_REGEN_TRESHOLD)
        {
            if(this.currentHp < this.maxHp)
            {
                this.currentHp += SHIELD_REGEN_AMOUNT;
                if(this.currentHp > this.maxHp)
                {
                    this.currentHp = this.maxHp;
                }
                this.counter = 0;
            }
        }
    }
}
function generateMoneyFromResourcesPoints()
{
    for(let i=0; i< resourcesSpots.length; i++)
    {
        resourcesSpots[i].generateMoney();
    }
}
function popResources()
{
    for(let i = 0; i< NBR_OF_LITTLE_RESOURCESPOTS; i++)
    {
        let littleResourcesSpot = new resourcesSpot(neutralPlayer, null, 1);
        let statusResourcesSpot = new status(false, false, false, false, false, C_WIDTH/(NBR_OF_LITTLE_RESOURCESPOTS+1) * (i+1), C_HEIGHT/2, null, null);
        littleResourcesSpot.status = statusResourcesSpot;

        resourcesSpots.push(littleResourcesSpot);

    }
    for(let j = 0; j< NBR_OF_MEDIUM_RESOURCESPOTS; j++)
    {
        let mediumResourcesSpot = new resourcesSpot(neutralPlayer, null, 2);
        let statusResourcesSpot2 = new status(false, false, false, false, false, (C_WIDTH + MEDIUM_RESOURCE_POINT_OFFSET)/(NBR_OF_MEDIUMRESOURCESPOTS+1) * (j+1), C_HEIGHT/2, null, null);
        mediumResourcesSpot.status = statusResourcesSpot2;

        resourcesSpots.push(mediumResourcesSpot);

    }

    for(let k = 0; k< NBR_OF_BIG_RESOURCESPOTS; k++)
    {
        let bigResourcesSpot = new resourcesSpot(neutralPlayer, null, 3);
        let statusResourcesSpot3 = new status(false, false, false, false, false, C_WIDTH/(NBR_OF_BIG_RESOURCESPOTS+1) * (k+1), C_HEIGHT/4, null, null);
        bigResourcesSpot.status = statusResourcesSpot3;

        resourcesSpots.push(bigResourcesSpot);

    }

    
}
function popResources(nbrOfSetsOf3)
{
    for(let j=0; j<nbrOfSetsOf3; j++)
    {
        for(let i = 0; i< NBR_OF_LITTLE_RESOURCESPOTS; i++)
        {
        let littleResourcesSpot = new resourcesSpot(neutralPlayer, null, 1);
        let statusResourcesSpot = new status(false, false, false, false, false, C_WIDTH/(NBR_OF_LITTLE_RESOURCESPOTS+1) * (i+1), C_HEIGHT/(nbrOfSetsOf3+1) * (j+1), null, null);
        littleResourcesSpot.status = statusResourcesSpot;

        resourcesSpots.push(littleResourcesSpot);

        }

    /* for(let l = 0; l< NBR_OF_MEDIUM_RESOURCESPOTS; l++)
    {
        let mediumResourcesSpot = new resourcesSpot(neutralPlayer, null, 2);
        let statusResourcesSpot2 = new status(false, false, false, false, false, (C_WIDTH + MEDIUM_RESOURCE_POINT_OFFSET)/(NBR_OF_MEDIUM_RESOURCESPOTS+2) * (j+1), C_HEIGHT/(nbrOfSetsOf3 +2*l), null, null);
        mediumResourcesSpot.status = statusResourcesSpot2;

        resourcesSpots.push(mediumResourcesSpot);

    }

    for(let k = 0; k< NBR_OF_BIG_RESOURCESPOTS; k++)
    {
        let bigResourcesSpot = new resourcesSpot(neutralPlayer, null, 3);
        let statusResourcesSpot3 = new status(false, false, false, false, false, C_WIDTH/(NBR_OF_BIG_RESOURCESPOTS+1) * (k+1), C_HEIGHT/4 +150, null, null);
        bigResourcesSpot.status = statusResourcesSpot3;

        resourcesSpots.push(bigResourcesSpot);

    } */
    }
}
function getMousePos(evt) {
    rect = canvas.getBoundingClientRect();
    return pos = {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
}

function _listmd(evt)
{
    rect = canvas.getBoundingClientRect();
    return md_pos = {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    }
}

function _listmu(evt)
{
    rect = canvas.getBoundingClientRect();
    return mu_pos = {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    }
}
function _listdest(evt)
{
        rect = canvas.getBoundingClientRect();
       return dest = {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
        } 
}
function addDestEvent()
{
    for(i=0; i<soldiers.length; i++)
    {
        if(soldiers[i].status.isSelected)
        {
            canvas.addEventListener('click', _listdest);
            return 0;
        }
    
    }
}
function removeDestEvent()
{
    canvas.removeEventListener('click', _listdest);
}
function addClickEvent()
{
    
    //canvas.addEventListener('click', _listpos);
    canvas.addEventListener('click', getMousePos);
}
function removeClickEvent()
{
    //canvas.removeEventListener('click', _listpos);
    canvas.removeEventListener('click', getMousePos);
}
function addDragBoxEvents()
{
    for(let i = 0; i<soldiers.length; i++)
    {
        if(soldiers[i].status.isSelected)
        {
            return 0;
        }
    }
    canvas.addEventListener('mousedown', _listmd);   
    canvas.addEventListener('mouseup', _listmu);
        
}
function removeDragBoxEvents()
{
    canvas.removeEventListener('mousedown', _listmd);
    canvas.removeEventListener('mouseup', _listmu)
}




function createPlayers()
{
    bluePlayer = new player("blue");
    redPlayer = new player("red");
    neutralPlayer = new player("black");
}
function createArrays()
{
    // let allObjects = new Array();
    soldiers = new Array();
    buildings = new Array();
    explosives = new Array();
    weapons = new Array();
    resourcesSpots = new Array();
    

}
function popBases()
{
    
   // blueBaseSoldier = new soldier(bluePlayer, "base Defender", null, 500, 0, null, null);
  //  blueBaseSoldier.image = soldier_png;
  // blueBaseSoldierWeapon = new weapon(blueBaseSoldier, rifle_png, 10, 10, 3);
   // blueBaseSoldier.weapon = blueBaseSoldierWeapon;
  //  blueBaseSoldierStatus = new status(false, false, true, false, (C_WIDTH/2), 20);
  //  blueBaseSoldier.status = blueBaseSoldierStatus;
    blueBaseStatus = new status(false, false, true, false, false, (C_WIDTH/2), 20, null, null);
    blueBase = new base(bluePlayer, military_base_png_blue, BASE_HP, null, 1, blueBaseStatus, null);
    blueBaseSlot_1 = new slot(true, (blueBase.status.x +20), (blueBase.status.y +20));
    blueBaseSlot_2 = new slot(true, (blueBase.status.x +20), (blueBase.status.y -20));
    blueBaseSlot_3 = new slot(true, (blueBase.status.x -20), (blueBase.status.y -20));
    blueBaseSlot_4 = new slot(true, (blueBase.status.x -20), (blueBase.status.y +20));
    blueBaseSlots = new baseSlots(blueBaseSlot_1, blueBaseSlot_2, blueBaseSlot_3, blueBaseSlot_4);
    blueBase.baseSlots = blueBaseSlots;

    //redBaseSoldier = new soldier(redPlayer, "base Defender", null, 500, 0, null, null);
    //redBaseSoldier.image = soldier_png;
    //redBaseSoldierWeapon = new weapon(redBaseSoldier, rifle_png, 10, 10, 3);
    //redBaseSoldier.weapon = redBaseSoldierWeapon;
    //redBaseSoldierStatus = new status(false, false, true, false, (C_WIDTH/2), (C_HEIGHT - 50));
   // redBaseSoldier.status = redBaseSoldierStatus;
    redBaseStatus = new status(false, false, true, false, false, (C_WIDTH/2), (C_HEIGHT - 50), null, null);
    redBase = new base(redPlayer, military_base_png_red, BASE_HP, null, 1, redBaseStatus, null);
    redBaseSlot_1 = new slot(true, (redBase.status.x +20), (redBase.status.y +20));
    redBaseSlot_2 = new slot(true, (redBase.status.x +20), (redBase.status.y -20));
    redBaseSlot_3 = new slot(true, (redBase.status.x -20), (redBase.status.y -20));
    redBaseSlot_4 = new slot(true, (redBase.status.x -20), (redBase.status.y +20));
    redBaseSlots = new baseSlots(redBaseSlot_1, redBaseSlot_2, redBaseSlot_3, redBaseSlot_4);
    redBase.baseSlots = redBaseSlots;

    // allObjects.push(blueBaseRifle, redBaseRifle, blueBase, redBase);
   // soldiers.push(blueBaseSoldier, redBaseSoldier);
    buildings.push(blueBase, redBase);

    
}
function loadImages()
{
    soldier_png = new Image();
    soldier_png.src = "images/resized_black/soldier.png";

    rifle_png = new Image();
    rifle_png.src = "images/resized_black/rifle.png";

    rifle_blue_png = new Image();
    rifle_blue_png.src = "images/resized_black/rifle_blue.png"

    rifle_red_png = new Image();
    rifle_red_png.src = "images/resized_black/rifle_red.png"

    sniper_png = new Image();
    sniper_png.src = "images/resized_black/sniper.png";

    tank_png = new Image();
    tank_png.src = "images/resized_black/tank.png";

    mortar_png = new Image();
    mortar_png.src = "images/resized_black/mortar.png";

    military_base_png = new Image();
    military_base_png.src = "images/resized_black/military_base.png";

    military_base_png_blue = new Image();
    military_base_png_blue.src = "images/resized_black/military_base_blue.png";

    military_base_png_red = new Image();
    military_base_png_red.src = "images/resized_black/military_base_red.png";

    grenade_png = new Image();
    grenade_png.src = "images/resized_black/grenade.png";

    shooting_png = new Image();
    shooting_png.src = "images/resized_black/shooting.png";

    under_fire_png = new Image();
    under_fire_png.src = "images/resized_black/under_fire.png";

    bomb_png = new Image();
    bomb_png.src = "images/resized_black/bomb.png";

    explosion_png = new Image();
    explosion_png.src = "images/resized_black/explosion.png";

    grenade_blue_png = new Image();
    grenade_blue_png.src = "images/resized_black/grenade_blue.png";

    grenade_red_png = new Image();
    grenade_red_png.src = "images/resized_black/grenade_red.png";

    sniper_blue_png = new Image();
    sniper_blue_png.src = "images/resized_black/sniper_blue.png";

    sniper_red_png = new Image();
    sniper_red_png.src = "images/resized_black/sniper_red.png";

    diamond_png = new Image();
    diamond_png.src = "images/resized_black/diamond.png";

    diamond_blue_png = new Image();
    diamond_blue_png.src = "images/resized_black/diamond_blue.png";

    diamond_red_png = new Image();
    diamond_red_png.src = "images/resized_black/diamond_red.png";

    shield_png = new Image();
    shield_png.src = "images/resized_black/shield.png";

    shield_blue_png = new Image();
    shield_blue_png.src = "images/resized_black/shield_blue.png";

    shield_red_png = new Image();
    shield_red_png.src = "images/resized_black/shield_red.png";
}

function doDrawing()
{
    ctx.clearRect(0,0,C_WIDTH, C_HEIGHT);
        ctx.fillStyle = "black";
        ctx.font = "20px Georgia";
        
        ctx.fillText("MONEY: "+ bluePlayer.money, 32, 32);

        for(let h=0; h<resourcesSpots.length; h++)
        {
            ctx.drawImage(resourcesSpots[h].image, resourcesSpots[h].status.x, resourcesSpots[h].status.y);
            if(resourcesSpots[h].captureProgression != 0)
            {
                ctx.font = "10px Georgia";
                ctx.fillText(Math.round(resourcesSpots[h].captureProgression/12) + " %", resourcesSpots[h].status.x, resourcesSpots[h].status.y -10);
            }
            for(let g = 0; g< soldiers.length; g++)
            {
                if(soldiers[g].player.color != resourcesSpots[h].player.color)
                {
                    let z = Math.hypot(soldiers[g].status.x - resourcesSpots[h].status.x, soldiers[g].status.y - resourcesSpots[h].status.y);
                    if(((z <= CAP_RANGE) && (z>=0)) || ((z>= CAP_RANGE) && (z < 0)))
                    {
                    ctx.beginPath();
                    ctx.arc(resourcesSpots[h].status.x +15, resourcesSpots[h].status.y +15, CAP_RANGE, 0, 2 * Math.PI);
                    ctx.lineWidth = 5;
                    ctx.strokeStyle = "yellow";
                    ctx.stroke();
                    }
                }
            }
        }
        for(let i=0; i< soldiers.length; i++)
        {
           
            ctx.drawImage(soldiers[i].image, soldiers[i].status.x, soldiers[i].status.y);
            ctx.font = "10px Georgia";
            
            ctx.fillText(Math.round(soldiers[i].hp), soldiers[i].status.x + 8, soldiers[i].status.y + 40);
            if(soldiers[i].status.isSelected)
            {
                ctx.lineWidth = 2;
                ctx.rect(soldiers[i].status.x - 3, soldiers[i].status.y -3, 42, 50);
                ctx.strokeStyle = "black";
                ctx.stroke();
            }
            if(soldiers[i].shield)
            {
                
                ctx.beginPath();
                ctx.arc(soldiers[i].status.x+15, soldiers[i].status.y+15, soldiers[i].shield.range, 0, 2 * Math.PI);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "green";
                ctx.stroke();
                ctx.fillText(Math.round(soldiers[i].shield.currentHp), soldiers[i].status.x + 8, soldiers[i].status.y -20);
            }
            // console.log("image " + soldiers[i].image + " created at :  " + soldiers[i].status.x + "  " + soldiers[i].status.y);
        }
        
        for(let j=0; j<buildings.length; j++)
        {
            ctx.drawImage(buildings[j].image, buildings[j].status.x, buildings[j].status.y);
            ctx.font = "10px Georgia";
            ctx.fillText(Math.round(buildings[j].hp), buildings[j].status.x + 4, buildings[j].status.y + 40);
            if(buildings[j].captureProgression != 0)
            {
                ctx.fillText(Math.round(buildings[j].captureProgression/12) + " %", buildings[j].status.x, buildings[j].status.y -10);
            }
        }

        for(let k=0; k <explosives.length; k++)
        {
            ctx.drawImage(bomb_png, explosives[k].x, explosives[k].y);
        }

        for(let l = 0; l < weapons.length; l++)
        {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.arc(weapons[l].soldier.status.x +8, weapons[l].soldier.status.y +8, weapons[l].range, 0, 2 * Math.PI);
            ctx.stroke();
        }
        
          
}


function checkCollisions(buildingsArray, mousePoint)
{
    for(i=0; i< buildingsArray.length; i++)
    {
        if(buildingsArray[i].isIntersect(mousePoint))
        {
           /* console.log('click on circle: ' + buildingsArray[i]);
            pos = {
                x : 1000,
                y : 1000
            }
            */
            openBuildingMenu();
        }
    }
}

function checkCollisionsSoldiers(soldiersArray, mousePoint)
{
    for(i=0; i< soldiersArray.length; i++)
    {   
        if(soldiersArray[i].status.isSelected == false)
        {
            if(soldiersArray[i].isIntersect(mousePoint))
            {
            /* console.log('click on circle: ' + buildingsArray[i]);
                pos = {
                    x : 1000,
                    y : 1000
                }
                */

            for(j=0; j< soldiersArray.length; j++)
            {
                    soldiersArray[j].status.isSelected = false; 
            }
                soldiersArray[i].status.isSelected = true;
                
              //  setTimeout(addDestinationListener(soldiersArray[i]), SYS_DELAY);
               // console.log(soldiersArray[i] + " is selected");
            
            }
        }
    }
}



function checkButtonsCollisions(menuButtonsArray, mousePoint)
{
    for(i=0; i< menuButtonsArray.length; i++)
    {
        if(menuButtonsArray[i].isIntersect(mousePoint))
        {
            
            switch(menuButtonsArray[i].name)
            {
                case "rifleman": blueSoldiersCount++;
                if(bluePlayer.money >= RIFLEMAN_COST)
                {
                    let blueRifleman = new soldier(bluePlayer, "rifleman", rifle_blue_png, RIFLEMAN_HP, RIFLEMAN_SPEED, null, null, nbrCount+1, RIFLE_THREATEN_LEVEL);
                    
                    let blueRifle = new weapon("rifle", blueRifleman, null, RIFLEMAN_RANGE, RIFLEMAN_DMG, RIFLEMAN_RATE_OF_FIRE, shooting_png, under_fire_png, true, 0);
                    
                    statusBlueRifleman = new status(false, false, true, false, false, blueBase.baseSlots.slot1.x, blueBase.baseSlots.slot1.y, null, null );
                    
                    blueRifleman.weapon = blueRifle;
                    blueRifleman.status = statusBlueRifleman;
                    weapons.push(blueRifle);
                    
                    soldiers.push(blueRifleman);
                    nbrCount++;
                    bluePlayer.money -= RIFLEMAN_COST;

                    closeBuildingMenu();
                    console.log("Blue Rifleman added to blue team!");
                }
                else
                {
                    console.log("Not enough money !!!");
                    closeBuildingMenu();
                }
                break;

                case "grenadier":
                if(bluePlayer.money >= GRENADIER_COST)
                {    
                let blueGrenadier = new soldier(bluePlayer, "grenadier", grenade_blue_png, GRENADIER_HP, GRENADIER_SPEED, null, null, nbrCount+1, GRENADIER_THREATEN_LEVEL);
                let blueGrenades = new weapon("grenades", blueGrenadier, null, GRENADIER_RANGE, null, null, shooting_png, under_fire_png, true, 0);
                
                statusBlueGrenadier = new status(false, false, true, false, false, blueBase.baseSlots.slot1.x, blueBase.baseSlots.slot1.y, null, null );

                blueGrenadier.weapon = blueGrenades;
                blueGrenadier.status = statusBlueGrenadier;
                weapons.push(blueGrenades);

                soldiers.push(blueGrenadier);
                nbrCount++;
                bluePlayer.money -= GRENADIER_COST;

                closeBuildingMenu();
                console.log("Blue Grenadier added to blue team!");
                }
                else
                {
                    console.log("Not enough money !!!");
                    closeBuildingMenu();
                }
                break;

                case "sniper":
                if(bluePlayer.money >= SNIPER_COST)
                {     
                let blueSniper = new soldier(bluePlayer, "sniper", sniper_blue_png, SNIPER_HP, SNIPER_SPEED, null, null, nbrCount+1, SNIPER_THREATEN_LEVEL);
                let blueSniperWeapon = new weapon("sniper", blueSniper, null, SNIPER_RANGE, SNIPER_DMG, null, shooting_png, under_fire_png, true, 0);
                statusBlueSniper = new status(false, false, true, false, false, blueBase.baseSlots.slot1.x, blueBase.baseSlots.slot1.y, null, null );

                blueSniper.weapon = blueSniperWeapon;
                blueSniper.status = statusBlueSniper;
                weapons.push(blueSniperWeapon);

                soldiers.push(blueSniper);
                nbrCount++;
                bluePlayer.money -= SNIPER_COST;

                closeBuildingMenu();
                console.log("Blue Sniper added to blue team!");
                }
                else
                {
                    console.log("Not enough money !!!");
                    closeBuildingMenu();
                }
                break;

                case "shieldman":
                if(bluePlayer.money >= SHIELD_COST)
                {
                let blueShieldman = new soldier(bluePlayer, "shieldman", shield_blue_png, SHIELDMAN_HP, SHIELDMAN_SPEED, null, null, nbrCount+1, SHIELD_THREATEN_LEVEL);
                let blueShield = new shield(blueShieldman);
                blueShieldman.shield = blueShield;
                statusBlueShieldman = new status(false, false, true, false, false, blueBase.baseSlots.slot1.x, blueBase.baseSlots.slot1.y, null, null );
                blueShieldman.status = statusBlueShieldman;
                soldiers.push(blueShieldman);
                nbrCount++;
                bluePlayer.money -= SHIELD_COST;

                closeBuildingMenu();
                console.log("Blue Shieldman added to blue team!");
                }
            }

            /*
                if(menuButtonsArray[i].name == "Rifleman")
                {
                    blueSoldiersCount++;
                    let soldier001 = new soldier(bluePlayer, "Rifleman", rifle_png_blue, 100, 3, null, null, nbrCount+1);
                    
                    let rifle001 = new weapon("rifle", soldier001, null, 100, 5, 1, shooting_png, under_fire_png, true, 0);
                    let statusSoldier001;
                    statusSoldier001 = new status(false, false, true, false, false, blueBase.baseSlots.slot1.x, blueBase.baseSlots.slot1.y, null, null );
                    
                    soldier001.weapon = rifle001;
                    soldier001.status = statusSoldier001;
                    weapons.push(rifle001);
                    
                    soldiers.push(soldier001);
                    nbrCount++;

                    closeBuildingMenu();
                    console.log("soldier001 added to team!");
                }
                else if(menuButtonsArray[i].name == "Grenadier")
                {
                    let soldier001 = new soldier(bluePlayer, "Grenadier", grenade_blue_png, 100, 3, null, null, nbrCount+1);
                    let grenades001 = new weapon("grenades", soldier001, null, 150, null, null, shooting_png, under_fire_png, true, 0);
                    let statusSoldier001;
                    statusSoldier001 = new status(false, false, true, false, false, blueBase.baseSlots.slot1.x, blueBase.baseSlots.slot1.y, null, null );

                    soldier001.weapon = grenades001;
                    soldier001.status = statusSoldier001;
                    weapons.push(grenades001);

                    soldiers.push(soldier001);
                    nbrCount++;

                    closeBuildingMenu();
                    console.log("soldier001 added to team!");
                }
         */
        }
    }
}


/* function createRedSoldier(soldierType, slot)
{
    switch (soldierType)
    {
        case "rifleman": let redRifleman = new soldier(redPlayer, "rifleman", rifle_red_png, 100, 3, null, null, nbrCount +1, RIFLE_THREATEN_LEVEL);
        let redRifle = new weapon("rifle", redRifleman, null, 100, 5, 1, shooting_png, under_fire_png, true, null);
        
        let statusRedRifleman = new status(false, false, true, false, false, slot.x, slot.y, null, null );
        
        redRifleman.weapon = redRifle;
        redRifleman.status = statusRedRifleman;
        weapons.push(redRifle);
        soldiers.push(redRifleman);
        nbrCount++;

        
        console.log("Red rifleman added to red team!");
        break;

        case "grenadier": let redGrenadier = new soldier(redPlayer, "grenadier", grenade_red_png, 100, 2, null, null, nbrCount +1, GRENADIER_THREATEN_LEVEL);
        let redGrenades = new weapon("grenades", redGrenadier, null, 150, null, 1, shooting_png, under_fire_png, true, null);
        
        let statusRedGrenadier = new status(false, false, true, false, false, slot.x, slot.y, null, null );
        
        redGrenadier.weapon = redGrenades;
        redGrenadier.status = statusRedGrenadier;
        weapons.push(redGrenades);
        soldiers.push(redGrenadier);
        nbrCount++;
        console.log("Red grenadier added to red team!");
        break;
    }
} */
function checkBoxSelection()
{
    if((md_pos != null) && (mu_pos != null))
    {
        for(let i=0; i<blueSoldiers.length; i++)
        {
            if(blueSoldiers[i].isInsideBox(md_pos, mu_pos))
            {
                blueSoldiers[i].status.isSelected = true;
                removeDragBoxEvents();
                window.addEventListener('keydown', _partialSelection);
            }
            else
            {
                blueSoldiers[i].status.isSelected = false;
            }
        }
        md_pos = null;
    mu_pos = null;
    }
    
    
}
function _partialSelection(evt)
{
    let keypressed = evt.keyCode;
    if(keypressed == 17)
    {
        console.log("passed 0");
        for(let i =0; i<blueSoldiers.length; i++)
        {
            if(blueSoldiers[i].status.isSelected == true)
            {
                
                    blueSoldiers[i].status.isSelected = false;
                
            }
        }
        window.removeEventListener('keydown', _partialSelection);
    }

    else if(keypressed == 49)
    {
        console.log("passed 1");
        for(let i =0; i<blueSoldiers.length; i++)
        {
            if(blueSoldiers[i].status.isSelected == true)
            {
                if(blueSoldiers[i].type != "rifleman")
                {
                    blueSoldiers[i].status.isSelected = false;
                }
            }
        }
        window.removeEventListener('keydown', _partialSelection);
    }
    else if (keypressed == 50)
    {
        console.log("passed 2");
        for(let i =0; i<blueSoldiers.length; i++)
        {
            if(blueSoldiers[i].status.isSelected == true)
            {
                if(blueSoldiers[i].type != "grenadier")
                {
                    blueSoldiers[i].status.isSelected = false;
                }
            }
        }
        window.removeEventListener('keydown', _partialSelection);
    }

    else if (keypressed == 51)
    {
        console.log("passed 3");
        for(let i =0; i<blueSoldiers.length; i++)
        {
            if(blueSoldiers[i].status.isSelected == true)
            {
                if(blueSoldiers[i].type != "sniper")
                {
                    blueSoldiers[i].status.isSelected = false;
                }
            }
        }
        window.removeEventListener('keydown', _partialSelection);
    }

    else if (keypressed == 52)
    {
        console.log("passed 4");
        for(let i =0; i<blueSoldiers.length; i++)
        {
            if(blueSoldiers[i].status.isSelected == true)
            {
                if(blueSoldiers[i].type != "shieldman")
                {
                    blueSoldiers[i].status.isSelected = false;
                }
            }
        }
        window.removeEventListener('keydown', _partialSelection);
    }

    else if (keypressed == 53)
    {
        console.log("passed 5");
        for(let i =0; i<blueSoldiers.length; i++)
        {
            if(blueSoldiers[i].status.isSelected == true)
            {
                if(blueSoldiers[i].type != "tank")
                {
                    blueSoldiers[i].status.isSelected = false;
                }
            }
        }
        window.removeEventListener('keydown', _partialSelection);
    }
}

function openBuildingMenu()
{
    isInBuildingMenu = true;

    ctx.font = "20 px Arial";
    
        for(i=0; i<buildingMenu.length; i++)
        {
            ctx.fillText(buildingMenu[i].name, buildingMenu[i].status.x, buildingMenu[i].status.y);
        }
    
}

function closeBuildingMenu()
{
    isInBuildingMenu = false;
}

function createMenu()
{
    const riflemanButton = new menuButton("rifleman", null, 100);
    const grenadierButton = new menuButton("grenadier", null, 200);
    const sniperButton = new menuButton("sniper", null, 250);
    const shieldButton = new menuButton("shieldman", null, 300);
    const tankButton = new menuButton("tank", null, 700);

    const riflemanButtonStatus = new status( false, false, false, false, false, blueBase.status.x, blueBase.status.y +75, null, null);
    const grenadierButtonStatus = new status( false, false, false, false, false, blueBase.status.x, blueBase.status.y +100, null, null);
    const sniperButtonStatus = new status( false, false, false, false, false, blueBase.status.x, blueBase.status.y +125, null, null);
    const shieldButtonStatus = new status( false, false, false, false, false, blueBase.status.x, blueBase.status.y +150, null, null);
    const tankButtonStatus = new status( false, false, false, false, false, blueBase.status.x, blueBase.status.y +175, null, null);

    riflemanButton.status = riflemanButtonStatus;
    grenadierButton.status = grenadierButtonStatus;
    sniperButton.status = sniperButtonStatus;
    shieldButton.status = shieldButtonStatus;
    tankButton.status = tankButtonStatus;

    buildingMenu.push(riflemanButton, grenadierButton, sniperButton, shieldButton, tankButton);
}

function checkMenuChoice()
{
    checkButtonsCollisions(buildingMenu, pos);
   // setTimeout(checkMenuChoice(), SYS_DELAY);
}



function waitForDestination()
{
    if(dest != null)
        {
            
            for(i=0; i<soldiers.length; i++)
            {
                if(soldiers[i].status.isSelected)
                    {
                   // console.log(" dest passed to " + soldiers[i].name);
                    soldiers[i].status.destX = dest.x;
                    soldiers[i].status.destY = dest.y;
                    
                    soldiers[i].status.isSelected = false;
                   // console.log(soldiers[i].name + " is deselected");
                                                          
                    }
            }
            dest = null;
        }
}


function moveSoldiers()
{
    for (i=0; i<soldiers.length; i++)
    {
        if((soldiers[i].status.destX != null) && (soldiers[i].status.destY != null))
        {
            //console.log(soldiers[i] + " is moving to " + soldiers[i].status.destX + " / " + soldiers[i].status.destY);
            soldiers[i].moveTo(soldiers[i].status.destX-16, soldiers[i].status.destY-16);
        }
    }
}
function checkAllTargets()
{
for(i=0; i<soldiers.length; i++)
{
    if(soldiers[i].weapon)
    {
    soldiers[i].weapon.checkTargets();
    }
}
}

function checkAllHp()
{
    for(i=0; i<soldiers.length; i++)
    {
       if(soldiers[i].hp <=0)
       {
           
           for(let j=0; j<weapons.length; j++)
           {
               if(weapons[j].soldier === soldiers[i])
                {
                    weapons.splice(j, 1);
                }
            }
            soldiers.splice(i, 1);
       }
    }
}
function checkExplosives()
{
    for(let i= explosives.length -1; i>=0; i--)
    {
        if((explosives[i].x == explosives[i].destX) && (explosives[i].y == explosives[i].destY))
        {
            explosives[i].explode();
            explosives.splice(i, 1);
        }
        else
        {
            explosives[i].moveTo(explosives[i].destX, explosives[i].destY);
        }
    }
    
}
function addToWeaponCount()
{
    for(let i=0; i < weapons.length; i++)
    {
        if((weapons[i].type == "grenades")&&(weapons[i].readyToShoot == false))
        {
            weapons[i].counter++;
            if(weapons[i].counter >= GRENADE_ATTACK_DELAY)
            {
                weapons[i].readyToShoot = true;
            }
        }

        if((weapons[i].type == "sniper")&&(weapons[i].readyToShoot == false))
        {
            weapons[i].counter++;
            if(weapons[i].counter >= SNIPER_ATTACK_DELAY)
            {
                weapons[i].readyToShoot = true;
            }
        }
    }
}

function checkBasesHp()
{
    for(i=0; i<buildings.length; i++)
    {
        if(buildings[i].hp <= 0)
        {
            if((buildings[i].player.color == "red") || (buildings[i].player.color == "blue") )
            {
            
            buildings[i].player = neutralPlayer;
            buildings[i].hp = BASE_HP;
            buildings[i].image = military_base_png;
            }
        }
    }
}

function checkResourcesSpotsCaptures()
{
    for(let i=0; i<resourcesSpots.length; i++)
    {
        //if(resourcesSpots[i].player.color == "black")
       //{
            let blueSoldiersCount = 0;
            let redSoldiersCount = 0;
            for(let j =0; j<soldiers.length; j++)
            {
                let dist = Math.hypot(soldiers[j].status.x - resourcesSpots[i].status.x ,soldiers[j].status.y - resourcesSpots[i].status.y );
               if(((dist <= CAP_RANGE) && (dist>0)) || ((dist>= CAP_RANGE) && (dist < 0)))
               {
                    if(soldiers[j].player.color == "blue")
                    {
                        blueSoldiersCount++;
                    }
                    else if (soldiers[j].player.color == "red")
                    {
                        redSoldiersCount++;
                    }
               }
            }
            if(redSoldiersCount > blueSoldiersCount)
            {
                startResourcesCapture(resourcesSpots[i], "red", redSoldiersCount - blueSoldiersCount);
                resourcesSpots[i].isBeingCaptured = true;
            }
            else if(blueSoldiersCount > redSoldiersCount)
            {
                startResourcesCapture(resourcesSpots[i], "blue", blueSoldiersCount - redSoldiersCount);
                resourcesSpots[i].isBeingCaptured = true;
            }
            else
            {
                resourcesSpots[i].isBeingCaptured = false ;
            }
        //}
    }
}

function startResourcesCapture(resourcesSpot, color, nbrOfUnits)
{
    if(color == "blue")
    {
        if(resourcesSpot.captureProgression < CAPTURE_TIME)
        {
            resourcesSpot.captureProgression += nbrOfUnits;
        }
        /* if(    (resourcesSpot.captureProgression >= CAPTURE_TIME/2)     &&     (resourcesSpot.captureProgression < CAPTURE_TIME)  )
        {
            resourcesSpot.player = neutralPlayer;
            
            resourcesSpot.image = diamond_png;
            
        } */
        else if(resourcesSpot.captureProgression >= CAPTURE_TIME)
        {
            resourcesSpot.player = bluePlayer;
            
            resourcesSpot.image = diamond_blue_png;
            
        }
    }
    if(color == "red")
    {
        if(resourcesSpot.captureProgression > -CAPTURE_TIME)
        {
            resourcesSpot.captureProgression -= nbrOfUnits;
        }
        /* if(            (resourcesSpot.captureProgression <= -CAPTURE_TIME/2) && (resourcesSpot.captureProgression > -CAPTURE_TIME)         )
        {
            resourcesSpot.player = neutralPlayer;
            
            resourcesSpot.image = diamond_png;
            
        } */
        else if (resourcesSpot.captureProgression <= -CAPTURE_TIME)
        {
            resourcesSpot.player = redPlayer;
            
            resourcesSpot.image = diamond_red_png;
            
        }
    }
}
function checkBasesCaptures()
{
    for (let i=0;i<buildings.length; i++ )
    {
        if((buildings[i].player.color == "black") && (buildings[i].hp <=0))
        {
            let blueSoldiersCount = 0;
            let redSoldiersCount = 0;
            for(let j=0; j<soldiers.length; j++)
            {
               let dist = Math.hypot(soldiers[j].status.x - buildings[i].status.x ,soldiers[j].status.y - buildings[i].status.y );
               if(((dist <= CAP_RANGE) && (dist>0)) || ((dist>= CAP_RANGE) && (dist < 0)))
               {
                    if(soldiers[j].player.color == "blue")
                    {
                        blueSoldiersCount++;
                    }
                    else if (soldiers[j].player.color == "red")
                    {
                        redSoldiersCount++;
                    }
               }
            }
            if(redSoldiersCount > blueSoldiersCount)
            {
                startCapture(buildings[i], "red", redSoldiersCount - blueSoldiersCount);
            }
            else if(blueSoldiersCount > redSoldiersCount)
            {
                startCapture(buildings[i], "blue", blueSoldiersCount - redSoldiersCount);
            }
            else
            {

            }
        }
    }
}

function startCapture(base, color, nbrOfUnits)
{
    if(color == "blue")
    {
        if(base.captureProgression < CAPTURE_TIME)
        {
            base.captureProgression += nbrOfUnits;
        }
        else if(base.captureProgression >= CAPTURE_TIME)
        {
            base.player = bluePlayer;
            base.hp = 1000;
            base.image = military_base_png_blue;
            base.captureProgression = 0;
        }
    }
    if(color == "red")
    {
        if(base.captureProgression > -CAPTURE_TIME)
        {
            base.captureProgression -= nbrOfUnits;
        }
        else if (base.captureProgression <= -CAPTURE_TIME)
        {
            base.player = redPlayer;
            base.hp = 1000;
            base.image = military_base_png_red;
            base.captureProgression = 0;
        }
    }
}

function checkAllDistances()
{
    for(let i=0; i<soldiers.length; i++)
    {
        soldiers[i].checkDistances();
    }
}

function drawCoordinates(x,y){
    let pointSize = 3; // Change according to the size of the point.
    ctx.fillStyle = "#ff2626"; // Red color

    ctx.beginPath(); //Start path
    ctx.arc(x, y, pointSize, 0, Math.PI * 2, true); // Draw a point using the arc function of the canvas with a point structure.
    ctx.fill(); // Close the path and fill.
}

function regenerateAllShields()
{
    for(let i=0; i<soldiers.length; i++)
    {
        if(soldiers[i].shield)
        {
            soldiers[i].shield.regenerateShield();
        }
    }
}

function getReferences()
{
    blueMoneyButton = document.getElementById("blueMoney");
    blueSoldiersButton = document.getElementById("blueSoldiers");
    bluePointsControlled = document.getElementById("pointsControlledBlue");
}

/* function displayBlueStats()
{
    blueMoneyButton.innerHTML = "MONEY: " + bluePlayer.money;
    let nbrOfBlueSoldiers = 0;
    for(let i=0; i<soldiers.length; i++)
    {
        if(soldiers[i].player == bluePlayer)
        {
            nbrOfBlueSoldiers++;
        }
    }
    let nbrOfPointsControlled = 0;
    for(let j =0; j< resourcesSpots.length; j++)
    {
        
        if(resourcesSpots[j].player == bluePlayer)
        {
            nbrOfPointsControlled++;
        }
    }
    blueSoldiersButton.innerHTML = 'SOLDIERS; ' + nbrOfBlueSoldiers;
    bluePointsControlled.innerHTML = "POINTS: " + nbrOfPointsControlled;
} */




function checkColor(soldierOrPoint, color) 
{
    return soldierOrPoint.player.color == color;
}

function updateResourcesSpotsArrays()
{   blueResourcesSpots = [];
    redResourcesSpots = [];
    neutralResourcesPoints = [];
    for(let i= resourcesSpots.length -1; i>=0; i--)
    {
        if(resourcesSpots[i].player.color == "blue")
        {
            blueResourcesSpots.push(resourcesSpots[i]);
        }
        else if(resourcesSpots[i].player.color == "red")
        {
            redResourcesSpots.push(resourcesSpots[i]);
        }
        else if(resourcesSpots[i].player.color == "black")
        {
            neutralResourcesPoints.push(resourcesSpots[i]);
        }
    }
}
function updateColoredSoldiersArrays()
{
    blueSoldiers = [];
    redSoldiers = [];
    neutralSoldiers = [];

    for(let i= soldiers.length -1; i>=0; i--)
    {
        if(soldiers[i].player.color == "blue")
        {
            blueSoldiers.push(soldiers[i]);
        }
        else if(soldiers[i].player.color == "red")
        {
            redSoldiers.push(soldiers[i]);
        }
        else if(soldiers[i].player.color == "black")
        {
            neutralSoldiers.push(soldiers[i]);
        }
    }
}














function init()
{
canvas = document.getElementById("myCanvas");
ctx = canvas.getContext("2d");
getReferences();
loadImages();
createPlayers();
createArrays();
popBases();
popResources(3);
addClickEvent();
createMenu();
//createRedSoldier("rifleman", redBase.baseSlots.slot1);
//createRedSoldier("grenadier", redBase.baseSlots.slot2);

AI_init();
setTimeout("gameCycle()", SYS_DELAY)
}
function gameCycle()
{
    doDrawing();
    //displayBlueStats();
    checkCollisions(buildings, pos);
    checkAllDistances();
    addDragBoxEvents();
    
    if(isInBuildingMenu)
        {
            setTimeout("checkMenuChoice()", SYS_DELAY);
        }
       // checkCollisionsSoldiers(soldiers, pos);
       removeDestEvent();
        checkBoxSelection();
        addDestEvent();
        waitForDestination();
        moveSoldiers();
        blueBase.checkSlots();
        checkAllTargets();
        
        checkExplosives();
        checkAllHp();
        checkBasesHp();
        checkBasesCaptures();
        checkResourcesSpotsCaptures();
        generateMoneyFromResourcesPoints();
        addToWeaponCount();
        regenerateAllShields();

        updateResourcesSpotsArrays();
        updateColoredSoldiersArrays()
        AI_loop();
        

        

   setTimeout("gameCycle()", SYS_DELAY);
        
    






























}