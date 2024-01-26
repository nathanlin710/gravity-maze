import {defs, tiny} from './examples/common.js';
import { Text_Line } from './examples/text-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

const {Textured_Phong} = defs

const acc_constant = .05;
const damping = .7;
const vel_max = 2;

export class Maze extends Scene {
    constructor() {
        super();

        this.shapes = {
            platform: new defs.Cube(),
            wall: new defs.Cube(),
            goal: new defs.Cube(),
            player: new defs.Subdivision_Sphere(4),
            text: new Text_Line(40)
        }

        this.shapes.platform.arrays.texture_coord = this.shapes.platform.arrays.texture_coord.map(x => x.times(4));

        this.walls = [
            [0, 105, 106, 1],
            [-63, 91, 29, 1],
            [-7, 91, 15, 1],
            [84, 91, 8, 1],
            [-42, 77, 36, 1],
            [14, 77, 8, 1],
            [84, 77, 22, 1],
            [-98, 63, 8, 1],
            [-42, 63, 36, 1],
            [21, 63, 15, 1],
            [84, 63, 8, 1],
            [-84, 49, 8, 1],
            [49, 49, 43, 1],
            [-49, 35, 29, 1],
            [0, 35, 8, 1],
            [70, 35, 22, 1],
            [-91, 21, 15, 1],
            [-14, 21, 8, 1],
            [14, 21, 8, 1],
            [42, 21, 8, 1],
            [70, 21, 8, 1],
            [98, 21, 8, 1],
            [-28, 7, 36, 1],
            [28, 7, 8, 1],
            [56, 7, 8, 1],
            [84, 7, 8, 1],
            [21, -7, 15, 1],
            [70, -7, 8, 1],
            [98, -7, 8, 1],
            [-84, -21, 8, 1],
            [-56, -21, 8, 1],
            [-28, -21, 8, 1],
            [14, -21, 8, 1],
            [-84, -35, 22, 1],
            [56, -35, 36, 1],
            [-98, -49, 8, 1],
            [-56, -49, 8, 1],
            [-14, -49, 22, 1],
            [42, -49, 22, 1],
            [91, -49, 15, 1],
            [-98, -63, 8, 1],
            [-49, -63, 15, 1],
            [0, -63, 22, 1],
            [84, -63, 8, 1],
            [-77, -77, 15, 1],
            [-21, -77, 15, 1],
            [35, -77, 15, 1],
            [-70, -91, 8, 1],
            [0, -91, 36, 1],
            [70, -91, 22, 1],
            [0, -105, 106, 1],
            [-105, 0, 1, 106],
            [105, 0, 1, 106],
            [-91, -98, 1, 8],
            [-91, -70, 1, 8],
            [-63, -84, 1, 8],
            [-49, -84, 1, 22],
            [-35, -84, 1, 8],
            [-7, -70, 1, 8],
            [7, -84, 1, 8],
            [21, -49, 1, 29],
            [35, -70, 1, 8],
            [49, -84, 1, 8],
            [49, -56, 1, 8],
            [63, -63, 1, 15],
            [77, -84, 1, 8],
            [91, -77, 1, 15],
            [-77, -49, 1, 15],
            [-63, -56, 1, 8],
            [-49, -28, 1, 22],
            [-35, -42, 1, 22],
            [-21, -42, 1, 8],
            [-21, -14, 1, 8],
            [-7, -14, 1, 22],
            [7, -42, 1, 8],
            [-91, -7, 1, 15],
            [-77, 7, 1, 29],
            [-63, 0, 1, 22],
            [-35, 7, 1, 15],
            [7, 7, 1, 15],
            [35, -7, 1, 15],
            [49, 0, 1, 36],
            [63, -14, 1, 8],
            [77, -7, 1, 29],
            [91, -14, 1, 8],
            [-91, 42, 1, 8],
            [-91, 77, 1, 15],
            [-77, 63, 1, 15],
            [-63, 42, 1, 8],
            [-49, 35, 1, 15],
            [-35, 56, 1, 8],
            [-21, 42, 1, 8],
            [-7, 42, 1, 22],
            [-7, 84, 1, 8],
            [7, 70, 1, 8],
            [7, 42, 1, 8],
            [21, 91, 1, 15],
            [21, 28, 1, 8],
            [35, 77, 1, 15],
            [35, 42, 1, 8],
            [49, 77, 1, 29],
            [63, 77, 1, 15],
            [77, 98, 1, 8],
            [77, 56, 1, 8],
            [91, 28, 1, 8]
        ]


        this.materials = {
            platform: new Material(new defs.Textured_Phong(),
                {ambient: .8, diffusivity: 1, specularity: .5,  texture: new Texture("assets/CedarBoards.png")}),
            wall:  new Material(new defs.Textured_Phong(),
                {ambient: 1, specularity: .5, diffusivity: 0, texture: new Texture("assets/wood.png")}),
            player: new Material(new defs.Textured_Phong(),
                {ambient: 1, specularity: .5, texture: new Texture("assets/ball.png")}),
            goal:  new Material(new defs.Phong_Shader(),
                {ambient: .5, specularity: 0, diffusivity: 1, color: hex_color("#0000FF")}),
            text: new Material(new defs.Textured_Phong(),
                {ambient: 1, texture: new Texture("assets/text.png")}),
        }

        this.complete = false;

        this.xangle = 0;
        this.yangle = 0;
        
        // Need to update default positions
        this.radius = 3;
        this.p_x = 0;
        this.p_y = 0;


        this.p_x = -98;
        this.p_y = -56;

        this.max_v_x = 0;
        this.min_v_x = 0;
        this.max_v_y = 0;
        this.min_v_y = 0;
        this.v_x = 0;
        this.v_y = 0;

        this.time = 0;

        this.initial_camera_location = Mat4.look_at(vec3(0, 0, 400), vec3(0, 0, -100), vec3(0, 10, 0));
    }

    make_control_panel() {
        this.key_triggered_button("Up", ['ArrowUp'], () => {
            if(this.xangle > -Math.PI/6){
                this.xangle = this.xangle - .02;
            }
        });
        // Down Movement (arrow key down)
        this.key_triggered_button("Down", ['ArrowDown'], () => {
            if(this.xangle < Math.PI/6){
                this.xangle = this.xangle + .02;
            }
        });

        // Left Movement (arrow key left)
        this.key_triggered_button("Left", ['ArrowLeft'], () => {
            if(this.yangle  > -Math.PI/6)
                this.yangle = this.yangle - .02;
        });

        // Right Movement (arrow key right)
        this.key_triggered_button("Right", ['ArrowRight'], () => {
            if(this.yangle < Math.PI/6){
                this.yangle = this.yangle + .025;
            }
        });
    }

    draw_wall(context, program_state, tx, ty, sx, sy, model_transform) {
        const wall_transform = model_transform.times(Mat4.translation(tx, ty, 13))
                                              .times(Mat4.scale(sx, sy, 8));
        this.shapes.wall.draw(context, program_state, wall_transform, this.materials.wall)
    }

    compute_acc(angle) {
        return Math.sin(angle) * acc_constant;
    }

    compute_vel(xangle, yangle) {
        this.v_x += this.compute_acc(xangle);
        this.v_y -= this.compute_acc(yangle);
        if (this.v_x > vel_max) {
            this.v_x = vel_max;
        } else if (this.v_x < -vel_max) {
            this.v_x = -vel_max;
        }

        if (this.v_y > vel_max) {
            this.v_y = vel_max;
        } else if (this.v_y < -vel_max) {
            this.v_y = -vel_max;
        }
    }

    compute_pos(xangle, yangle) {
        this.compute_vel(xangle, yangle);
        this.p_x += this.v_x;
        this.p_y += this.v_y;
    }

    check_wall(wall) {
        let tx = wall[0];
        let ty = wall[1];
        let sx = wall[2];
        let sy = wall[3];

        // sphere collision detection
        const x = Math.max(tx - sx, Math.min(this.p_x, tx + sx));
        const y = Math.max(ty - sy, Math.min(this.p_y, ty + sy));

        const distance = Math.sqrt(
            (x - this.p_x) * (x - this.p_x) +
            (y - this.p_y) * (y - this.p_y)
        );

        return distance < this.radius;

    }

    check_goal() {
        if (!this.complete) {
            const distance = Math.sqrt((this.p_x - 98) ** 2 + (this.p_y + 14) ** 2);
            if (distance <= 6) {
                this.complete = true;
            }
        }
    }

    collision_detection() {
        for(let i = 0; i < this.walls.length; i++) {
            if(this.check_wall(this.walls[i])) {
                let tx = this.walls[i][0];
                let ty = this.walls[i][1];
                let sx = this.walls[i][2];
                let sy = this.walls[i][3];
                if(this.p_x <= tx - sx) {
                    this.p_x = tx - sx - this.radius;
                    this.v_x = this.v_x * -1 * damping;
                } else if(this.p_x >= tx + sx) {
                    this.p_x = tx + sx + this.radius;
                    this.v_x = this.v_x * -1 * damping;
                } else if (this.p_y <= ty - sy) {
                    this.p_y = ty - sy - this.radius;
                    this.v_y = this.v_y * -1 * damping;
                } else if (this.p_y >= ty + sy) {
                    this.p_y = ty + sy + this.radius;
                    this.v_y = this.v_y * -1 * damping;
                }
            }
        }
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            program_state.set_camera(this.initial_camera_location);
        }

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, .1, 1000);
        const t = program_state.animation_time / 1000;
        const light_position = vec4(0, 0, 300, 1);
        program_state.lights = [new Light(light_position, color(.3, .2, .1, 1), 1000000)];

        if (!this.complete) {
            this.time = Math.floor(t);
        }
        let text_transform = Mat4.identity().times(Mat4.scale(2, 2, 2)).times(Mat4.translation(-5, 30, 100));
        this.shapes.text.set_string('Time: ' + this.time, context.context);
        this.shapes.text.draw(context, program_state, text_transform, this.materials.text);

        const model_transform = Mat4.identity();

        // Draw bounding box
        let right_bound_transform = model_transform
            .times(Mat4.translation(140, 0, 13))
            .times(Mat4.scale(8, 147, 8));
        this.shapes.platform.draw(context, program_state, right_bound_transform, this.materials.platform);

        let left_bound_transform = model_transform
            .times(Mat4.translation(-140, 0, 13))
            .times(Mat4.scale(8, 147, 8));
        this.shapes.platform.draw(context, program_state, left_bound_transform, this.materials.platform);

        let top_bound_transform = model_transform
            .times(Mat4.translation(0, 140, 13))
            .times(Mat4.scale(147, 8, 8));
        this.shapes.platform.draw(context, program_state, top_bound_transform, this.materials.platform);

        let bottom_bound_transform = model_transform
            .times(Mat4.translation(0, -140, 13))
            .times(Mat4.scale(147, 8, 8));
        this.shapes.platform.draw(context, program_state, bottom_bound_transform, this.materials.platform);

        const platform_transform = model_transform
            .times(Mat4.rotation(this.xangle, 1, 0, 0))
            .times(Mat4.rotation(this.yangle, 0, 1, 0))
            .times(Mat4.scale(106, 106, 5));
        
        this.shapes.platform.draw(context, program_state, platform_transform, this.materials.platform);
        for (let i = 0; i < this.walls.length; i++) {
            let wall_transform = platform_transform.times(Mat4.scale(1/106, 1/106, 1/5))
            this.draw_wall(context, program_state, this.walls[i][0], this.walls[i][1], this.walls[i][2], this.walls[i][3], wall_transform)
        }

        const goal_transform = platform_transform
            .times(Mat4.scale(1/106, 1/106, 1/5))
            .times(Mat4.translation(98, -14, 9))
            .times(Mat4.scale(4, 4, 4));

        this.shapes.goal.draw(context, program_state, goal_transform, this.materials.goal);

        this.check_goal();
        if (this.complete) {
            text_transform = text_transform.times(Mat4.translation(-20, -30, 0)).times(Mat4.scale(5, 5, 1));
            this.shapes.text.set_string('YOU WIN!', context.context);
            this.shapes.text.draw(context, program_state, text_transform, this.materials.text);
        }

        this.compute_pos(this.yangle, this.xangle);
        if (this.p_x < 104 && this.p_x > -104) {
            if (this.p_y < 104 && this.p_y > -104) {
            this.max_v_x = Math.max(this.max_v_x, this.v_x);
            this.max_v_y = Math.max(this.max_v_y, this.v_y);
            this.min_v_x = Math.min(this.min_v_x, this.v_x);
            this.min_v_y = Math.min(this.min_v_y, this.v_y);
            console.log(this.max_v_x, this.min_v_x, this.max_v_y, this.min_v_y);
            }
        }
        this.collision_detection();

        let player_transform = platform_transform
            .times(Mat4.scale(1/106, 1/106, 1/5))
            .times(Mat4.translation(this.p_x, this.p_y, 10))
            .times(Mat4.scale(this.radius, this.radius, this.radius));


        this.collision_detection();
        if (!this.complete) {
            this.shapes.player.draw(context, program_state, player_transform, this.materials.player);
        }
    }
}